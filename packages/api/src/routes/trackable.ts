import prisma from "@sailviz/db";
import * as Types from "@sailviz/types";
import { createORPCClient, onError } from "@orpc/client";

const { implement, ORPCError } = require("@orpc/server");
import { ORPCcontract } from "../contract";
import { RPCLink } from "@orpc/client/fetch";
import { TrackableContract } from "./trackable-contract";
import { ContractRouterClient } from "@orpc/contract";
const os = implement(ORPCcontract);

const link = new RPCLink({
  url: "https://api.dev.trackable.uk",
  interceptors: [
    onError((error: any) => {
      console.error(error);
    }),
  ],
});
const trackableClient: ContractRouterClient<typeof TrackableContract> =
  createORPCClient(link);

export const trackable_createParticipant =
  os.trackable.createParticipant.handler(async ({ input, context }) => {
    console.log("trackable_createParticipant input", input);
    const res = trackableClient.participant.create({
      orgId: input.orgId,
      eventId: input.eventId,
      deviceId: input.deviceId,
    });
    console.log("trackable_createParticipant", res);
    return res;
  });
