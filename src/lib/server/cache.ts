export type CmsJsonCacheOptions = {
    fetch?: typeof fetch;
    now?: () => number;
    maxEntries?: number;
    freshMs?: number;
    maxAgeMs?: number;
    baseUrl: URL | string;
};

type CachedJsonResponse = {
    status: number;
    statusText: string;
    headers: [string, string][];
    body: string;
    storedAt: number;
};

type FetchedJsonResponse = Omit<CachedJsonResponse, 'storedAt'>;

type FetchOutcome =
    | { kind: 'success'; value: CachedJsonResponse }
    | { kind: 'http-failure'; value: FetchedJsonResponse }
    | { kind: 'network-failure'; error: unknown };

type CacheEntry = {
    value?: CachedJsonResponse;
    inFlight?: Promise<FetchOutcome>;
};

// This cache approximates Next's 60-second public CMS revalidation for JSON GETs.
// Stale-while-revalidate is a short resilience window, not a promise that CMS
// publishes are invisible for exactly 60 seconds.
const DEFAULT_MAX_ENTRIES = 200;
const DEFAULT_FRESH_MS = 60_000;
const DEFAULT_MAX_AGE_MS = 5 * 60_000;
const CACHE_AFFECTING_HEADERS = ['accept', 'accept-language'];
const BYPASS_HEADERS = [
    'authorization',
    'cookie',
    'preview',
    'x-preview',
    'umbraco-preview',
    'x-umbraco-preview',
    'api-key',
    'x-api-key',
];

function isAllowlistedPublicCmsJsonGet(url: URL, baseUrl: URL): boolean {
    if (url.origin !== baseUrl.origin) {
        return false;
    }

    if (url.pathname === '/umbraco/delivery/api/v2/content') {
        return true;
    }

    if (url.pathname.startsWith('/umbraco/delivery/api/v2/content/item/')) {
        return true;
    }

    return /^\/api\/v1\/conference\/[^/]+\/schedule$/.test(url.pathname);
}

function hasBypassHeader(headers: Headers): boolean {
    for (const header of BYPASS_HEADERS) {
        if (headers.has(header)) {
            return true;
        }
    }

    const cacheControl = headers.get('cache-control')?.toLowerCase();
    return cacheControl
        ? /(?:^|,|\s)(?:no-store|no-cache|private)(?:,|\s|$)/.test(cacheControl)
        : false;
}

function hasBypassCacheMode(request: Request): boolean {
    return (
        request.cache === 'no-store' ||
        request.cache === 'reload' ||
        request.cache === 'no-cache'
    );
}

function getCacheKey(request: Request): string {
    const parts = [request.method.toUpperCase(), request.url];

    for (const header of CACHE_AFFECTING_HEADERS) {
        parts.push(`${header}:${request.headers.get(header) ?? ''}`);
    }

    return parts.join('\n');
}

function makeResponse(
    value: FetchedJsonResponse | CachedJsonResponse,
): Response {
    return new Response(value.body, {
        status: value.status,
        statusText: value.statusText,
        headers: value.headers,
    });
}

function cloneCacheableHeaders(headers: Headers): [string, string][] {
    const copied = new Headers(headers);
    copied.delete('set-cookie');
    copied.delete('set-cookie2');
    return [...copied.entries()];
}

async function readJsonResponse(
    response: Response,
    storedAt: number,
): Promise<FetchOutcome> {
    const headers = cloneCacheableHeaders(response.headers);
    const bodyText = await response.text();
    const base = {
        status: response.status,
        statusText: response.statusText,
        headers,
    };

    if (!response.ok) {
        return {
            kind: 'http-failure',
            value: { ...base, body: bodyText },
        };
    }

    try {
        const parsed = bodyText ? JSON.parse(bodyText) : null;
        return {
            kind: 'success',
            value: {
                ...base,
                body: JSON.stringify(parsed),
                storedAt,
            },
        };
    } catch (error) {
        return { kind: 'network-failure', error };
    }
}

function shouldCacheRequest(request: Request, baseUrl: URL): boolean {
    if (request.method.toUpperCase() !== 'GET') {
        return false;
    }

    if (hasBypassHeader(request.headers) || hasBypassCacheMode(request)) {
        return false;
    }

    return isAllowlistedPublicCmsJsonGet(new URL(request.url), baseUrl);
}

function makeRequest(input: RequestInfo | URL, init?: RequestInit): Request {
    if (input instanceof Request) {
        return init ? new Request(input, init) : input.clone();
    }

    return new Request(input, init);
}

export function createCmsJsonFetch(options: CmsJsonCacheOptions): typeof fetch {
    const fetchFn = options.fetch ?? globalThis.fetch.bind(globalThis);
    const now = options.now ?? Date.now;
    const baseUrl = new URL(options.baseUrl);
    const maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
    const freshMs = options.freshMs ?? DEFAULT_FRESH_MS;
    const maxAgeMs = options.maxAgeMs ?? DEFAULT_MAX_AGE_MS;
    const cache = new Map<string, CacheEntry>();

    function pruneExpiredEntries(currentTime: number): void {
        for (const [key, entry] of cache) {
            if (
                !entry.inFlight &&
                entry.value &&
                currentTime - entry.value.storedAt > maxAgeMs
            ) {
                cache.delete(key);
            }
        }
    }

    function pruneSize(): void {
        while (cache.size > maxEntries) {
            const oldestKey = cache.keys().next().value as string | undefined;
            if (!oldestKey) {
                return;
            }
            cache.delete(oldestKey);
        }
    }

    function startRefresh(
        key: string,
        request: Request,
    ): Promise<FetchOutcome> {
        const existing = cache.get(key);
        if (existing?.inFlight) {
            return existing.inFlight;
        }

        const inFlight = fetchFn(request.clone())
            .then((response) => readJsonResponse(response, now()))
            .then((outcome) => {
                const entry = cache.get(key);
                if (outcome.kind === 'success') {
                    cache.set(key, { value: outcome.value });
                    pruneExpiredEntries(now());
                    pruneSize();
                    return outcome;
                }

                if (
                    outcome.kind === 'http-failure' &&
                    outcome.value.status >= 400 &&
                    outcome.value.status < 500
                ) {
                    cache.delete(key);
                } else if (entry) {
                    delete entry.inFlight;
                }

                return outcome;
            })
            .catch((error: unknown) => {
                const entry = cache.get(key);
                if (entry) {
                    delete entry.inFlight;
                }
                return {
                    kind: 'network-failure',
                    error,
                } satisfies FetchOutcome;
            });

        cache.set(key, { value: existing?.value, inFlight });
        return inFlight;
    }

    return async (input: RequestInfo | URL, init?: RequestInit) => {
        const request = makeRequest(input, init);

        if (!shouldCacheRequest(request, baseUrl)) {
            return fetchFn(input, init);
        }

        const currentTime = now();
        pruneExpiredEntries(currentTime);

        const key = getCacheKey(request);
        const entry = cache.get(key);
        const value = entry?.value;

        if (value) {
            const age = currentTime - value.storedAt;

            if (age <= freshMs) {
                return makeResponse(value);
            }

            if (age <= maxAgeMs) {
                void startRefresh(key, request);
                return makeResponse(value);
            }
        }

        const outcome = await startRefresh(key, request);

        if (outcome.kind === 'success') {
            return makeResponse(outcome.value);
        }

        if (outcome.kind === 'http-failure') {
            return makeResponse(outcome.value);
        }

        throw outcome.error;
    };
}
