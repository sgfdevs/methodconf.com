export async function POST(request: Request): Promise<Response> {
    const NEWSLETTER_ENDPOINT = process.env.NEWSLETTER_ENDPOINT;
    const NEWSLETTER_LIST_ID = process.env.NEWSLETTER_LIST_ID;

    if (!NEWSLETTER_ENDPOINT || !NEWSLETTER_LIST_ID) {
        return Response.json({ success: false }, { status: 500 });
    }

    const { name, email, nullCheck } = await request.json();

    if (!nullCheck) {
        try {
            await fetch(NEWSLETTER_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    list_uuids: [NEWSLETTER_LIST_ID],
                }),
            }).then((res) => res.json());
        } catch (err) {
            return Response.json({ success: false }, { status: 500 });
        }
    }

    return Response.json({ success: true });
}
