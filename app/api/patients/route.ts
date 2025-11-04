import { BASE_BACKEND_URL } from "@/constants";
import { do_get, do_post } from "@/utils";
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
  let patients = await do_get(`${BASE_BACKEND_URL}/api/v1/patients/${search}`);
  return NextResponse.json(patients);
}

export async function POST(Request: Request) {
  const body = await Request.json();
  let patients = await do_post(`${BASE_BACKEND_URL}/api/v1/patients/`, body);
  return NextResponse.json(patients);
}
