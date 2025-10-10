import type { BetterAuthClientPlugin } from "better-auth";

// Client-side implementation of the plugin API that calls the server endpoint
// directly. This avoids importing server-side code (which imports Prisma) into
// the browser bundle.
export const myPluginClient = (): BetterAuthClientPlugin => {
  return {
    id: "my-plugin",
    // Provide a `client` object with the expected endpoint methods. The
    // createAuthClient implementation will attach this under `client.myPlugin`.
    client: {
      authByUuid: async (opts: {
        uuid: string;
        fetchOptions?: RequestInit;
      }) => {
        const fetchOptions = opts.fetchOptions || { method: "POST" };
        const res = await fetch("/my-plugin/auth-by-uuid", {
          method: (fetchOptions.method as string) || "POST",
          headers: {
            "Content-Type": "application/json",
            ...(fetchOptions.headers || {}),
          },
          body: JSON.stringify({ uuid: opts.uuid }),
        });
        const data = await res.json();
        return { data, error: !res.ok ? data : null, status: res.status };
      },
    },
  } as unknown as BetterAuthClientPlugin;
};
