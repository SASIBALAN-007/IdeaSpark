
const API = "/api";

export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    credentials: "include",
    headers: body
      ? { "Content-Type": "application/json" }
      : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(
      data?.message || `Request failed (${res.status})`
    );
  }

  return data;
}
