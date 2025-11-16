import { BASE_BACKEND_URL } from "@/constants";
import { do_delete, do_get, do_put, get_auth } from "@/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Note: params is now a Promise
) {
  const { id } = await params; // Await params before destructuring
  const token = (await cookies()).get("token")?.value || "";
  console.log("The patient id is", id);
  try {
    let patient = await do_get(
      `${BASE_BACKEND_URL}/api/v1/patients/${id}`,
      get_auth(token)
    );
    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch patient" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const token = (await cookies()).get("token")?.value || "";

  try {
    let updatedPatient = await do_put(
      `${BASE_BACKEND_URL}/api/v1/patients/${id}`,
      body,
      get_auth(token)
    );
    return NextResponse.json(updatedPatient);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update patient" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = (await cookies()).get("token")?.value || "";

  try {
    let result = await do_delete(
      `${BASE_BACKEND_URL}/api/v1/patients/${id}`,
      get_auth(token)
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete patient" },
      { status: 500 }
    );
  }
}
