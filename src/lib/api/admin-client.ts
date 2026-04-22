import { auth } from "@/lib/firebase";

/**
 * Makes an authenticated fetch request to an admin API route.
 * Automatically attaches the current user's Firebase ID token as a Bearer token.
 *
 * Usage:
 *   const data = await adminFetch("/api/admin/products");
 *   const data = await adminFetch("/api/admin/products", { method: "POST", body: JSON.stringify({...}) });
 */
export async function adminFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }

  const idToken = await user.getIdToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}
