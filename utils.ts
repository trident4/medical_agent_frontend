export function get_auth(token: string) {
  try {
    return `Bearer ${token.replaceAll('"', "")}`;
  } catch (e) {
    return "";
  }
}

const options = (auth: string) => ({
  headers: {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const do_get = async (url: string, token: string) => {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: options(token).headers,
      // Important: Add cache behavior for Next.js (optional)
      cache: "no-store", // or "force-cache", depending on your need
    });

    if (!res.ok) {
      const errorBody = await res.text();
      return { error: errorBody, status: res.status };
    }

    return res.json();
  } catch (error) {
    console.error("GET error:", error);
    throw error;
  }
};

export const do_post = async (url: string, data: any, token: string) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: options(token).headers,
      body: JSON.stringify(data),
      // Important: Add cache behavior for Next.js (optional)
      cache: "no-store", // or "force-cache", depending on your need
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw errorText;
    }

    return res.json();
  } catch (error) {
    throw error;
  }
};
export const do_put = async (url: string, data: any, token: string) => {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: options(token).headers,
      body: JSON.stringify(data),
      // Important: Add cache behavior for Next.js (optional)
      cache: "no-store", // or "force-cache", depending on your need
    });

    if (!res.ok) {
      if (res.status === 401) {
        deleteCookie("token");
      }
      const errorText = await res.text();
      throw new Error(
        `Fetch failed: ${res.status} ${res.statusText} - ${errorText}`
      );
    }

    return res.json();
  } catch (error) {
    console.error("PUT error:", error);
    throw error;
  }
};

export const do_delete = async (url: string, token: string) => {
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: options(token).headers,
      // Important: Add cache behavior for Next.js (optional)
      cache: "no-store", // or "force-cache", depending on your need
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Fetch failed: ${res.status} ${res.statusText} - ${errorText}`
      );
    }

    // DELETE APIs may return JSON or no content (e.g., 204 No Content)
    if (res.status === 204) {
      return { success: true };
    }
    return res.json();
  } catch (error) {
    console.error("DELETE error:", error);
    throw error;
  }
};

export const fetcherPost = (url: string, body: any) =>
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());

export function buildUrl(
  url: string,
  params: Record<string, string | number>
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    searchParams.append(key, String(value));
  }
  return `${url}?${searchParams.toString()}`;
}

export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
  return undefined;
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const handleLogout = async () => {
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
    });

    if (response.ok) {
      // Redirect to login after successful logout
      window.location.href = "/login";
    } else {
      console.error("Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};
