import { BASE_BACKEND_URL } from "@/constants";
import { do_delete, do_get, do_put, get_auth } from "@/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Note: params is now a Promise
) {
  try {
    const { id } = await params; // Await params before destructuring
    const token = (await cookies()).get("token")?.value || "";
    let patient = await do_get(
      `${BASE_BACKEND_URL}/patients/${id}`,
      get_auth(token)
    );
    return NextResponse.json(patient);
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const token = (await cookies()).get("token")?.value || "";

    let updatedPatient = await do_put(
      `${BASE_BACKEND_URL}/patients/${id}`,
      body,
      get_auth(token)
    );
    return NextResponse.json(updatedPatient);
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = (await cookies()).get("token")?.value || "";

    let result = await do_delete(
      `${BASE_BACKEND_URL}/patients/${id}`,
      get_auth(token)
    );
    return NextResponse.json(result);
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
