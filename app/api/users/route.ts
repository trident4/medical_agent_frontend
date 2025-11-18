import { BASE_BACKEND_URL } from "@/constants";
import { do_delete, do_get, do_post, get_auth } from "@/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { search, searchParams } = new URL(request.url);
  const token = (await cookies()).get("token")?.value || "";

  try {
    let users = await do_get(
      `${BASE_BACKEND_URL}/api/v1/users/${search}`,
      get_auth(token)
    );
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const token = (await cookies()).get("token")?.value || "";

  try {
    let user = await do_post(
      `${BASE_BACKEND_URL}/api/v1/users/`,
      body,
      get_auth(token)
    );
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { error: JSON.parse(error).detail || "Failed to create user" },
      { status: 500 }
    );
  }
}
