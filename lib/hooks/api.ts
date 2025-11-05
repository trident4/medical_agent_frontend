import { useState } from "react";

export function useApi<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const apiCall = async (
    url: string,
    payload?: any,
    method: string = "GET"
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    setData(null);

    // Base fetch config
    const metaData: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    // Add body only if not GET or DELETE
    if (method.toUpperCase() !== "GET" && method.toUpperCase() !== "DELETE") {
      metaData.body = JSON.stringify(payload);
    }

    try {
      const res = await fetch(url, metaData);

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || "Failed to fetch");
      }

      const json = (await res.json()) as T;
      setData(json);
      return json;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    get: (url: string) => apiCall(url, null, "GET"),
    post: (url: string, payload: any) => apiCall(url, payload, "POST"),
    put: (url: string, payload: any) => apiCall(url, payload, "PUT"),
    del: (url: string) => apiCall(url, null, "DELETE"),
    data,
    error,
    loading,
  };
}
