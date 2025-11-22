import { createAuthEndpoint } from "better-auth/api";
import type { BetterAuthPlugin } from "better-auth";
import prisma from "@sailviz/db";
import { setSessionCookie } from "better-auth/cookies";
import { scrypt, timingSafeEqual } from "node:crypto";
// Dummy function: replace with your actual user lookup/auth logic
async function readUserByUUID(uuid: string) {
  // Example: fetch user from DB and return user object or null
  const user = await prisma.user.findUnique({
    where: { uuid: uuid },
  });
  return user;
}
const hex = {
  encode: (buf) => Buffer.from(buf).toString("hex"),
  decode: (hexstr) => Buffer.from(hexstr, "hex"),
};
function scryptAsync(password, salt, opts) {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      opts.dkLen,
      { N: opts.N, r: opts.r, p: opts.p, maxmem: opts.maxmem },
      (err, derivedKey) => {
        if (err) return reject(err);
        resolve(derivedKey);
      }
    );
  });
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
          console.log(
            "sessionByToken: received token header:",
            tokenFromHeader ||
              ctx.request.headers.get("x-session-token") ||
              ctx.request.headers.get("x-token")
          );
          if (!token) {
            return ctx.json({ error: "Missing token" }, { status: 401 });
          }

          const session = await prisma.session.findUnique({
            where: { token },
          });
          console.log(
            "sessionByToken: lookup result session=",
            session
              ? {
                  id: session.id,
                  userId: session.userId,
                  expiresAt: session.expiresAt,
                }
              : null
          );
          if (!session) {
            return ctx.json({ error: "Session not found" }, { status: 401 });
          }
          if (new Date(session.expiresAt) < new Date()) {
            return ctx.json({ error: "Session expired" }, { status: 401 });
          }

          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { roles: true },
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
      // Allow clients to delete a session by bearer token (Tauri sign-out).
      sessionByTokenDelete: createAuthEndpoint(
        "/my-plugin/session-by-token",
        {
          method: "DELETE",
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

          const deleted = await prisma.session.deleteMany({ where: { token } });
          console.log("sessionByToken DELETE: deleted count=", deleted.count);
          return ctx.json({ deleted: deleted.count });
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

          const user = await prisma.user.findFirst({
            where: { username },
            include: { roles: true },
          });
          if (!user) {
            return ctx.json(
              { error: "account doesn't exist" },
              { status: 401 }
            );
          }

          // Find any account row with a password for this user
          const account = await prisma.account.findFirst({
            where: { userId: user.id, NOT: { password: null } },
          });
          if (!account || !account.password) {
            return ctx.json({ error: "Invalid account" }, { status: 401 });
          }

          let ok = false;

          const [salt, keyHex] = account.password.split(":");
          if (!salt || !keyHex) throw new Error("Invalid hash");
          const targetKey: any = await await scryptAsync(
            password.normalize("NFKC"),
            salt,
            {
              N: 16384,
              r: 16,
              p: 1,
              dkLen: 64,
              maxmem: 67108864,
            }
          );
          const expected = hex.decode(keyHex);
          if (targetKey.length !== expected.length) return false;
          ok = timingSafeEqual(targetKey, expected);

          if (!ok) {
            console.warn("Password verification failed for user", user.id);
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

          console.log(
            "tauriSignIn: created session token=",
            token,
            "userId=",
            user.id
          );

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
