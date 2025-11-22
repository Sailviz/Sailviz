import { createAuthEndpoint } from "better-auth/api";
import type { BetterAuthPlugin } from "better-auth";
import prisma from "@sailviz/db";
import { setSessionCookie } from "better-auth/cookies";
import bcrypt from "bcryptjs";
// Dummy function: replace with your actual user lookup/auth logic
async function readUserByUUID(uuid: string) {
  // Example: fetch user from DB and return user object or null
  const user = await prisma.user.findUnique({
    where: { uuid: uuid },
  });
  return user;
}

export const myPlugin = () => {
  return {
    id: "my-plugin",
    endpoints: {
      authByUUID: createAuthEndpoint(
        "/my-plugin/auth-by-uuid",
        {
          method: "POST",
        },
        async (ctx) => {
          const { uuid } = ctx.body;
          console.log("Received UUID:", uuid);
          if (!uuid) {
            return ctx.json({ error: "UUID required" }, { status: 400 });
          }
          const user = await readUserByUUID(uuid);
          console.log("User found:", user);
          if (!user) {
            return ctx.json({ error: "User not found" }, { status: 404 });
          }

          const session = {
            id: crypto.randomUUID(),
            token: crypto.randomUUID(),
            userId: user.id,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day expiry
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await setSessionCookie(ctx, {
            session,
            user: {
              ...user,
              email: user.email ?? "", //This accounts for users without an email
            },
          });
          return ctx.json({
            message: "Authenticated",
            user,
            // Return the session token so non-http clients (e.g. Tauri) can
            // store it and use it for subsequent requests via Authorization header.
            token: session.token,
            expiresAt: session.expiresAt,
          });
        }
      ),
      // New endpoint: allow clients to exchange a bearer token for the
      // full session payload (user + club + session). This is useful for
      // desktop apps using a custom URI scheme where cookies are not
      // available (Tauri), so the client can send `Authorization: Bearer <token>`.
      sessionByToken: createAuthEndpoint(
        "/my-plugin/session-by-token",
        {
          method: "GET",
        },
        async (ctx) => {
          const authHeader = ctx.request.headers.get("authorization") || "";
          const tokenFromHeader = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null;
          const token =
            tokenFromHeader ||
            ctx.request.headers.get("x-session-token") ||
            ctx.request.headers.get("x-token");
          if (!token) {
            return ctx.json({ error: "Missing token" }, { status: 401 });
          }

          const session = await prisma.session.findUnique({
            where: { token },
          });
          if (!session) {
            return ctx.json({ error: "Session not found" }, { status: 401 });
          }
          if (new Date(session.expiresAt) < new Date()) {
            return ctx.json({ error: "Session expired" }, { status: 401 });
          }

          const user = await prisma.user.findUnique({
            where: { id: session.userId },
          });
          if (!user) {
            return ctx.json({ error: "User not found" }, { status: 404 });
          }

          // Lookup club like the server-side customSession plugin does
          let club = null;
          if (user.clubId) {
            club = await prisma.club.findFirst({
              where: { id: user.clubId },
              include: { stripe: true },
            });
          }

          return ctx.json({
            user,
            club,
            session,
          });
        }
      ),
      // Tauri-friendly username/password sign-in which returns a token
      // (cookies won't work in custom URI schemes). This creates a session
      // record and returns the token so desktop/mobile clients can store it.
      tauriSignIn: createAuthEndpoint(
        "/my-plugin/tauri-signin",
        {
          method: "POST",
        },
        async (ctx) => {
          const { username, password } = ctx.body || {};
          if (!username || !password) {
            return ctx.json(
              { error: "username and password required" },
              { status: 400 }
            );
          }

          const user = await prisma.user.findFirst({ where: { username } });
          if (!user) {
            return ctx.json({ error: "Invalid credentials" }, { status: 401 });
          }

          // Find any account row with a password for this user
          const account = await prisma.account.findFirst({
            where: { userId: user.id, NOT: { password: null } },
          });
          if (!account || !account.password) {
            return ctx.json({ error: "Invalid credentials" }, { status: 401 });
          }

          const ok = await bcrypt.compare(password, account.password as string);
          if (!ok) {
            return ctx.json({ error: "Invalid credentials" }, { status: 401 });
          }

          const token = crypto.randomUUID();
          const now = new Date();
          const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day

          const session = await prisma.session.create({
            data: {
              id: crypto.randomUUID(),
              token,
              expiresAt,
              createdAt: now,
              updatedAt: now,
              userId: user.id,
              ipAddress: ctx.request.headers.get("x-forwarded-for") || null,
              userAgent: ctx.request.headers.get("user-agent") || null,
            },
          });

          let club = null;
          if (user.clubId) {
            club = await prisma.club.findFirst({
              where: { id: user.clubId },
              include: { stripe: true },
            });
          }

          return ctx.json({
            user,
            club,
            token: session.token,
            expiresAt: session.expiresAt,
          });
        }
      ),
    },
  } satisfies BetterAuthPlugin;
};

export const myPluginInstance = myPlugin();
