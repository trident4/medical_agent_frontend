export const do_get = async (url: string, cookies?: string) => {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookies ? { Cookie: cookies } : {}),
      },
      // Important: Add cache behavior for Next.js (optional)
      cache: "no-store", // or "force-cache", depending on your need
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Fetch failed: ${res.status} ${res.statusText} - ${errorText}`
      );
    }

    return res.json();
  } catch (error) {
    console.error("GET error:", error);
    throw error;
  }
};

export const do_post = async (url: string, data: any, cookies?: string) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookies ? { Cookie: cookies } : {}),
      },
      body: JSON.stringify(data),
      // Important: Add cache behavior for Next.js (optional)
      cache: "no-store", // or "force-cache", depending on your need
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Fetch failed: ${res.status} ${res.statusText} - ${errorText}`
      );
    }

    return res.json();
  } catch (error) {
    console.error("POST error:", error);
    throw error;
  }
};
export const do_put = async (url: string, data: any, cookies?: string) => {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(cookies ? { Cookie: cookies } : {}),
      },
      body: JSON.stringify(data),
      // Important: Add cache behavior for Next.js (optional)
      cache: "no-store", // or "force-cache", depending on your need
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Fetch failed: ${res.status} ${res.statusText} - ${errorText}`
      );
    }

    return res.json();
  } catch (error) {
    console.error("GET error:", error);
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
