import "server-only";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

// Calls the backend from the server. Never throws: failures come back as { ok: false, error }.
export async function api<T>(
  path: string,
  { method = "GET", body, token }: { method?: string; body?: unknown; token?: string } = {},
): Promise<ApiResult<T>> {
  const isForm = body instanceof FormData; // let fetch set the multipart boundary
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      return { ok: false, status: res.status, error: json.error ?? json.message ?? res.statusText };
    }
    return { ok: true, data: json.data };
  } catch {
    return { ok: false, status: 0, error: "Cannot reach the server" };
  }
}
