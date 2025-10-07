import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { router } from "@trackable/api/router";

const link = new RPCLink({ url: "http://localhost:3000" });

export const orpc: RouterClient<typeof router> = createORPCClient(link);
