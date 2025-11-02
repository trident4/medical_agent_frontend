import { BASE_BACKEND_URL } from "@/constants";
import { do_get } from "@/utils";
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
export async function GET() {
  let patients = await do_get(`${BASE_BACKEND_URL}/api/v1/patients/`);
  return NextResponse.json(patients);
}
