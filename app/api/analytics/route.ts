import { BASE_BACKEND_URL } from "@/constants";
import { get_auth } from "@/utils";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const cookieStore = await cookies();
        const tokenValue = cookieStore.get('token')?.value || "";
        const token = get_auth(tokenValue);

        // Call backend analytics endpoint with streaming
        const response = await fetch(`${BASE_BACKEND_URL}/analytics/query/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new Response(
                JSON.stringify({ error: errorText || 'Analytics request failed' }),
                {
                    status: response.status,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Return the streaming response directly
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: any) {
        console.error('Analytics streaming error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
