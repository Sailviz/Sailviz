import {
  customSessionClient,
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { myPluginClient } from "./client-plugin";
import type { ClubType, UserType } from "@sailviz/types";
import { BASE_URL } from "./config";

export const client = createAuthClient({
  baseURL: BASE_URL,
  basePath: "/api/auth/",
  plugins: [
    usernameClient(),
    inferAdditionalFields({
      user: {
        startPage: {
          type: "string",
          required: true,
        },
      },
      club: {
        type: "json",
        required: true,
      },
    }),
    // Do not import the server `auth` value here (it imports Prisma).
    // The generic type is optional for the client plugin; omitting it
    // avoids bundling server-only code into the browser.
    customSessionClient(),
    myPluginClient(),
  ],
});

// Destructure core methods but provide a thin, typed wrapper for `useSession`
// so consumer code sees the `club` field (which we populate on the server
// via `customSession`). We avoid importing the server `auth` runtime here
// (it pulls Prisma) and only depend on shared types in `@sailviz/types`.
const { signUp, signIn, signOut, useSession: _useSession, getSession } = client;

export { signUp, signIn, signOut, getSession };

// Infer the raw return type of the library useSession, then augment the
// `data` property with our known `club` shape. At runtime this is a no-op
// (we just call the original hook) but TS consumers will see `club`.
export const useSession = () => {
  return _useSession() as ReturnType<typeof _useSession> & {
    data:
      | (ReturnType<typeof _useSession>["data"] & {
          club: ClubType | null;
          user: UserType;
        })
      | null;
  };
};
