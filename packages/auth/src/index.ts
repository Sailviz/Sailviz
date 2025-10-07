// Core BetterAuth instance
export { auth } from "./auth";

// Session utilities
export { getSession } from "./session";
export type { Session } from "./session";

// oRPC middleware
export { withSession } from "./orpc";

// client-side helpers
export { authClient } from "./client"; // if you have one
