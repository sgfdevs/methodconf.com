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
    | { kind: 'uncacheable-success'; value: FetchedJsonResponse }
    | { kind: 'http-failure'; value: FetchedJsonResponse }
    | { kind: 'network-failure'; error: unknown };

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

function hasNoStoreNoCacheOrPrivate(headers: Headers): boolean {
    const cacheControl = headers.get('cache-control')?.toLowerCase();
    return cacheControl
        ? /(?:^|,|\s)(?:no-store|no-cache|private)(?:,|\s|$)/.test(cacheControl)
        : false;
}

function hasBypassHeader(headers: Headers): boolean {
    for (const header of BYPASS_HEADERS) {
        if (headers.has(header)) {
            return true;
        }
    }

    return hasNoStoreNoCacheOrPrivate(headers);
}

function hasPrivateResponseState(headers: Headers): boolean {
    return (
        hasNoStoreNoCacheOrPrivate(headers) ||
        headers.has('set-cookie') ||
        headers.has('set-cookie2')
    );
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

function cloneResponseHeaders(headers: Headers): [string, string][] {
    return [...headers.entries()];
}

function cloneCacheableHeaders(headers: Headers): [string, string][] {
    const copied = new Headers(headers);
    copied.delete('set-cookie');
    copied.delete('set-cookie2');
    return cloneResponseHeaders(copied);
}

function makeSharedRefreshRequest(request: Request): Request {
    return new Request(request, { signal: new AbortController().signal });
}

function getAbortReason(signal: AbortSignal): unknown {
    return (
        signal.reason ??
        new DOMException('The operation was aborted.', 'AbortError')
    );
}

function throwIfAborted(signal: AbortSignal): void {
    if (signal.aborted) {
        throw getAbortReason(signal);
    }
}

async function waitForOutcome(
    promise: Promise<FetchOutcome>,
    signal: AbortSignal,
): Promise<FetchOutcome> {
    throwIfAborted(signal);

    return await new Promise<FetchOutcome>((resolve, reject) => {
        const cleanup = () => signal.removeEventListener('abort', onAbort);
        const onAbort = () => {
            cleanup();
            reject(getAbortReason(signal));
        };

        signal.addEventListener('abort', onAbort, { once: true });
        promise.then(
            (value) => {
                cleanup();
                resolve(value);
            },
            (error: unknown) => {
                cleanup();
                reject(error);
            },
        );
    });
}

async function readJsonResponse(
    response: Response,
    storedAt: number,
): Promise<FetchOutcome> {
    const privateResponse = hasPrivateResponseState(response.headers);
    const headers = privateResponse
        ? cloneResponseHeaders(response.headers)
        : cloneCacheableHeaders(response.headers);
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
        const body = JSON.stringify(parsed);

        if (privateResponse) {
            return {
                kind: 'uncacheable-success',
                value: { ...base, body },
            };
        }

        return {
            kind: 'success',
            value: {
                ...base,
                body,
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
    const cache = new Map<string, CachedJsonResponse>();
    const activeRequests = new Map<string, Promise<FetchOutcome>>();

    function pruneExpiredEntries(currentTime: number): void {
        for (const [key, value] of cache) {
            if (currentTime - value.storedAt > maxAgeMs) {
                cache.delete(key);
            }
        }
    }

    function storeResponse(key: string, value: CachedJsonResponse): void {
        if (!cache.has(key) && cache.size >= maxEntries) {
            const oldestKey = cache.keys().next().value;
            if (oldestKey !== undefined) {
                cache.delete(oldestKey);
            }
        }
        cache.set(key, value);
    }

    function startRefresh(
        key: string,
        request: Request,
    ): Promise<FetchOutcome> | undefined {
        const existing = activeRequests.get(key);
        if (existing) {
            return existing;
        }

        // Never evict active requests. Their callers must keep coalescing even
        // if the completed response is evicted or the upstream fetch hangs.
        if (activeRequests.size >= maxEntries) {
            return undefined;
        }

        const inFlight = (async (): Promise<FetchOutcome> => {
            try {
                const response = await fetchFn(
                    makeSharedRefreshRequest(request),
                );
                return await readJsonResponse(response, now());
            } catch (error) {
                return { kind: 'network-failure', error };
            }
        })().then((outcome) => {
            if (activeRequests.get(key) !== inFlight) {
                return outcome;
            }

            activeRequests.delete(key);
            pruneExpiredEntries(now());
            if (outcome.kind === 'success') {
                storeResponse(key, outcome.value);
            } else if (
                outcome.kind === 'uncacheable-success' ||
                (outcome.kind === 'http-failure' &&
                    outcome.value.status >= 400 &&
                    outcome.value.status < 500)
            ) {
                cache.delete(key);
            }

            return outcome;
        });

        activeRequests.set(key, inFlight);
        return inFlight;
    }

    return async (input: RequestInfo | URL, init?: RequestInit) => {
        const request = makeRequest(input, init);

        if (!shouldCacheRequest(request, baseUrl)) {
            return fetchFn(input, init);
        }

        throwIfAborted(request.signal);

        const currentTime = now();
        pruneExpiredEntries(currentTime);

        const key = getCacheKey(request);
        const value = cache.get(key);

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

        const inFlight = startRefresh(key, request);
        if (!inFlight) {
            // Excess distinct requests are caller-owned and cannot write to or
            // invalidate the cache when they eventually finish.
            return fetchFn(input, init);
        }

        const outcome = await waitForOutcome(inFlight, request.signal);

        if (
            outcome.kind === 'success' ||
            outcome.kind === 'uncacheable-success'
        ) {
            return makeResponse(outcome.value);
        }

        if (outcome.kind === 'http-failure') {
            return makeResponse(outcome.value);
        }

        throw outcome.error;
    };
}
