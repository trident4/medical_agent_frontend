"use server";

import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  console.log("Attempting login to backend:", baseUrl);

  if (!baseUrl) {
    console.error("NEXT_PUBLIC_API_BASE_URL is not defined");
    return { error: "Server configuration error: Missing backend URL" };
  }

  try {
    const response = await fetch(
      `${baseUrl}/auth/login/json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Login failed with status:", response.status, data);
      return { error: data.message || `Login failed: ${response.status}` };
    }

    // Store token in cookies with security attributes
    const cookieStore = await cookies();
    cookieStore.set("token", data.access_token, {
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax", // CSRF protection
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error: any) {
    console.error("Login error details:", error);
    return { error: `Connection failed: ${error.message}` };
  }
}
