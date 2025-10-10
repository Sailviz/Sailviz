import {
  customSessionClient,
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { myPluginClient } from "./client-plugin";
export const client = createAuthClient({
  plugins: [
    usernameClient(),
    inferAdditionalFields({
      user: {
        clubId: {
          type: "string",
          required: true,
        },
        startPage: {
          type: "string",
          required: true,
        },
      },
    }),
    // Do not import the server `auth` value here (it imports Prisma).
    // The generic type is optional for the client plugin; omitting it
    // avoids bundling server-only code into the browser.
    customSessionClient(),
    myPluginClient(),
  ],
});

export const { signUp, signIn, signOut, useSession, getSession } = client;
