import { BASE_BACKEND_URL } from "@/constants";
import { get_auth } from "@/utils";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const cookieStore = await cookies();
        const tokenValue = cookieStore.get('token')?.value || "";
        const token = get_auth(tokenValue);

        const response = await fetch(`${BASE_BACKEND_URL}/agents/ask/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
            });
        }

        // Return the stream directly
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        console.error("Stream API Error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
