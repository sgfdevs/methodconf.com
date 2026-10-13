export interface NewsletterConfig {
    endpoint?: URL;
    listId?: string;
}

export interface NewsletterResult {
    body: { success: boolean };
    status: number;
}

export type NewsletterFetch = (
    input: string,
    init: RequestInit,
) => Promise<Response>;

const DEFAULT_TIMEOUT_MS = 5_000;

function failure(status: number): NewsletterResult {
    return { body: { success: false }, status };
}

function success(): NewsletterResult {
    return { body: { success: true }, status: 200 };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function trimString(value: unknown): string | undefined {
    return typeof value === 'string' ? value.trim() : undefined;
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+$/.test(value);
}

export async function handleNewsletterRequest(
    request: Request,
    config: NewsletterConfig,
    fetcher: NewsletterFetch = fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<NewsletterResult> {
    const { endpoint, listId } = config;

    if (!endpoint || !listId) {
        return failure(500);
    }

    let payload: unknown;

    try {
        payload = await request.json();
    } catch {
        return failure(400);
    }

    return submitNewsletter(payload, { endpoint, listId }, fetcher, timeoutMs);
}

export async function submitNewsletter(
    payload: unknown,
    config: Required<NewsletterConfig>,
    fetcher: NewsletterFetch = fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<NewsletterResult> {
    if (!isRecord(payload)) {
        return failure(400);
    }

    if (payload.nullCheck) {
        return success();
    }

    const email = trimString(payload.email);

    if (!email || !isValidEmail(email)) {
        return failure(400);
    }

    const name = trimString(payload.name) ?? '';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetcher(config.endpoint.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                list_uuids: [config.listId],
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            return failure(502);
        }

        const upstream = await response.json().catch(() => undefined);

        if (!isRecord(upstream) || upstream.data !== true) {
            return failure(502);
        }
    } catch {
        return failure(controller.signal.aborted ? 504 : 502);
    } finally {
        clearTimeout(timeout);
    }

    return success();
}
