import { BASE_BACKEND_URL } from "@/constants";
import { do_post, get_auth } from "@/utils";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";


// {
//   "question": "Which patient has the most visits?",
//   "sql_query": "SELECT p.first_name, p.last_name, p.patient_id, COUNT(v.id) as visit_count \n                         FROM patients p \n                         JOIN visits v ON p.id = v.patient_id \n                         GROUP BY p.id \n                         ORDER BY visit_count DESC \n                         LIMIT 1;",
//   "results": [
//     {
//       "first_name": "John",
//       "last_name": "Smith",
//       "patient_id": "PAT001",
//       "visit_count": 6
//     }
//   ],
//   "row_count": 1,
//   "explanation": "John Smith (patient ID PAT001) has the highest number of visits in the dataset. He has a total of 6 visits.",
//   "error": null
// }
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const cookieStore = await cookies();
        const tokenValue = cookieStore.get('token')?.value || "";
        const token = get_auth(tokenValue);
        // Assuming you need to send the token in headers to the backend
        let answer = await do_post(
            `${BASE_BACKEND_URL}/analytics/query/`,
            body,
            token
        );
        return NextResponse.json(answer);
    } catch (error: any) {
        // Check if it's our custom HttpError
        if (error.status) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }
        // For other errors, return 500
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
