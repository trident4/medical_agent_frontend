import { BASE_BACKEND_URL } from "@/constants";
import { do_delete, do_get, do_post, get_auth } from "@/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { search, searchParams } = new URL(request.url);
    const token = (await cookies()).get("token")?.value || "";

    let users = await do_get(
      `${BASE_BACKEND_URL}/users/${search}`,
      get_auth(token)
    );
    return NextResponse.json(users);
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = (await cookies()).get("token")?.value || "";

    let user = await do_post(
      `${BASE_BACKEND_URL} /users/`,
      body,
      get_auth(token)
    );
    return NextResponse.json(user);
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
