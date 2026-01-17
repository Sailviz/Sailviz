// Tauri auth helper: stores and retrieves the bearer token using
// `tauri-plugin-store-api` and exposes helpers to attach token to fetch
// requests.

import { Store } from "@tauri-apps/plugin-store";

const store = new Store("sailviz-store.dat");
const TOKEN_KEY = "bearer_token";

export async function storeToken(token: string) {
  try {
    await store.set(TOKEN_KEY, token);
    await store.save();
  } catch (e) {
    console.error("Failed to store token in Tauri store:", e);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    const value = (await store.get(TOKEN_KEY)) as string | null;
    return value ?? null;
  } catch (e) {
    console.error("Failed to read token from Tauri store:", e);
    return null;
  }
}

export async function removeToken() {
  try {
    await store.delete(TOKEN_KEY);
    await store.save();
  } catch (e) {
    console.error("Failed to remove token from Tauri store:", e);
  }
}

// A small helper to attach Authorization header using the stored token.
export async function authFetch(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const token = await getToken();
  const headers = new Headers(init?.headers as HeadersInit);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const merged: RequestInit = { ...init, headers };
  return fetch(input, merged);
}
