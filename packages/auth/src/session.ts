import { auth } from "./auth";
import type { Session } from "better-auth";

export const getSession = async (req: Request): Promise<Session | null> => {
  return await auth.api.getSession(req).then((res) => {
    return res.session;
  });
};

export type { Session };
