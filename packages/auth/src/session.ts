import { auth } from "./auth";
import type { Session } from "better-auth";

export const getSession = async (req: Request): Promise<Session | null> => {
  return await auth.session(req);
};

export type { Session };
