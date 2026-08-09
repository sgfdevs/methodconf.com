import { getNewsletterConfig } from '@/serverConfig';

export async function POST(request: Request): Promise<Response> {
    const { endpoint, listId } = getNewsletterConfig();

    if (!endpoint || !listId) {
        return Response.json({ success: false }, { status: 500 });
    }

    const { name, email, nullCheck } = await request.json();

    if (!nullCheck) {
        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    list_uuids: [listId],
                }),
            }).then((res) => res.json());
        } catch {
            return Response.json({ success: false }, { status: 500 });
        }
    }

    return Response.json({ success: true });
}
