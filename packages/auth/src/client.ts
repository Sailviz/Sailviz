import {
  anonymousClient,
  customSessionClient,
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { BASE_URL } from "./config";
import * as Types from "@sailviz/types";

export const client = createAuthClient({
  baseURL: BASE_URL,
  basePath: "/api/auth",
  plugins: [
    organizationClient({
      teams: {
        enabled: true,
      },
    }),

    anonymousClient(),
    customSessionClient(),
    inferAdditionalFields({
      user: {
        startPage: {
          type: "string",
          required: true,
        },
      },
    }),
  ],
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("bearer_token") || "",
    },
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token");
      if (authToken) {
        localStorage.setItem("bearer_token", authToken || "");
      }
    },
  },
});

// Destructure core methods but provide a thin, typed wrapper for `useSession`
// so consumer code sees the `club` field (which we populate on the server
// via `customSession`). We avoid importing the server `auth` runtime here
// (it pulls Prisma) and only depend on shared types in `@sailviz/types`.
const {
  signUp,
  signIn,
  signOut,
  useSession: _useSession,
  getSession: _getSession,
} = client;

export { signUp, signIn, signOut };
export type Session = typeof client.$Infer.Session;

// Wrap the library `getSession` so desktop clients (Tauri) can fall back
// to token-based session retrieval when cookies aren't available.
export async function getSession(fetchOptions?: RequestInit) {
  const opts: any = fetchOptions
    ? { fetchOptions }
    : { fetchOptions: { credentials: "include" } };
  const res = await _getSession(opts as any);
  // If cookie session exists, return it unchanged.
  if (res.data !== null) return res;

  // Try token stored in localStorage (set by Tauri login flow).
  try {
    const token =
      typeof window !== "undefined"
        ? (window as any).localStorage?.getItem("sailviz_token")
        : null;
    if (token) {
      const tokenRes = await getSessionByToken(token);
      if (!tokenRes.error) {
        return {
          data: tokenRes.data,
          error: null,
          status: tokenRes.status,
        } as any;
      }
    }
  } catch (e) {}

  return res;
}

// Helper for non-cookie clients (Tauri): fetch the session by bearer token.
export async function getSessionByToken(token: string) {
  const res = await fetch(`${BASE_URL}/api/auth/my-plugin/session-by-token`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return { data, error: !res.ok ? data : null, status: res.status };
}

// Infer the raw return type of the library useSession, then augment the
// `data` property with our known `club` shape. At runtime this is a no-op
// (we just call the original hook) but TS consumers will see `club`.
export const useSession = () => {
  return _useSession() as ReturnType<typeof _useSession> & {
    data:
      | (ReturnType<typeof _useSession>["data"] & {
          org: Types.Org | null;
          user: Types.UserType;
        })
      | null;
  };
};
