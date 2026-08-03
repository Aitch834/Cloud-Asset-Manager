const buildUrl = (path) => `/api${path}`;
const apiUrl = (path) => `/api/${path.replace(/^\/+/, "")}`;
const headers = () => ({ "Content-Type": "application/json" });
async function request(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}
const api = {
  get: (path) => request(buildUrl(path)),
  post: (path, body) => request(buildUrl(path), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body)
  }),
  put: (path, body) => request(buildUrl(path), {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body)
  }),
  delete: (path) => request(buildUrl(path), { method: "DELETE" })
};
export {
  api as a,
  apiUrl as b
};
