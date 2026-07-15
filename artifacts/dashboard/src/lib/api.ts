const buildUrl = (path: string) => `/api${path}`;

const headers = () => ({ "Content-Type": "application/json" });

async function request(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: (path: string): Promise<any> =>
    request(buildUrl(path)),

  post: (path: string, body: unknown): Promise<any> =>
    request(buildUrl(path), {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    }),

  put: (path: string, body: unknown): Promise<any> =>
    request(buildUrl(path), {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(body),
    }),

  delete: (path: string): Promise<any> =>
    request(buildUrl(path), { method: "DELETE" }),
};
