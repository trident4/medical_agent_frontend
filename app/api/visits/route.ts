import { BASE_BACKEND_URL } from "@/constants";
import { do_get, do_post, get_auth } from "@/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Sample patient data format
// {
//     "id": 1,
//     "patient_id": "PAT001",
//     "full_name": "John Smith",
//     "age": 40,
//     "last_visit": "2025-10-27T09:45:00",
//     "visit_count": 2
//   },
export async function GET(request: Request) {
  try {
    const { search, searchParams } = new URL(request.url);
    const token = (await cookies()).get("token")?.value || "";
    let patients = await do_get(
      `${BASE_BACKEND_URL}/api/v1/visits/${search}`,
      get_auth(token)
    );
    return NextResponse.json(patients);
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

export async function POST(Request: Request) {
  try {
    const body = await Request.json();
    const token = (await cookies()).get("token")?.value || "";

    let patients = await do_post(
      `${BASE_BACKEND_URL}/api/v1/visits/`,
      body,
      get_auth(token)
    );
    return NextResponse.json(patients);
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
