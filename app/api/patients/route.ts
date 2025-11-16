import { BASE_BACKEND_URL } from "@/constants";
import { do_delete, do_get, do_post, get_auth } from "@/utils";
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
  const { search, searchParams } = new URL(request.url);
  const token = (await cookies()).get("token")?.value || "";
  let patients = await do_get(
    `${BASE_BACKEND_URL}/api/v1/patients/${search}`,
    get_auth(token)
  );
  return NextResponse.json(patients);
}

export async function POST(Request: Request) {
  const body = await Request.json();
  const cookiesStore = cookies();
  const token = (await cookies()).get("token")?.value || "";

  let patients = await do_post(
    `${BASE_BACKEND_URL}/api/v1/patients/`,
    body,
    get_auth(token)
  );
  return NextResponse.json(patients);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Patient ID is required" },
      { status: 400 }
    );
  }
  const token = (await cookies()).get("token")?.value || "";
  // Assuming do_delete is available in @/utils, similar to do_get and do_post
  let result = await do_delete(
    `${BASE_BACKEND_URL}/api/v1/patients/${id}`,
    get_auth(token)
  );
  return NextResponse.json(result);
}
