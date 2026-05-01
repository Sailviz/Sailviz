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

export const trackable_participant_create =
  os.trackable.participant.create.handler(async ({ input, context }) => {
    const res = trackableClient.participant.create(input);
    return res;
  });

export const trackable_event_create = os.trackable.event.create.handler(
  async ({ input, context }) => {
    // Placeholder implementation
    const res = trackableClient.event.create(input);
    return res;
  },
);

export const trackable_event_update = os.trackable.event.update.handler(
  async ({ input, context }) => {
    // Placeholder implementation
    const res = trackableClient.event.update(input);
    return res;
  },
);

export const trackable_device_list = os.trackable.device.list.handler(
  async ({ input, context }) => {
    const res = trackableClient.device.all(input);
    return res;
  },
);

export const trackable_waypoint_setEvent =
  os.trackable.waypoint.setEvent.handler(async ({ input, context }) => {
    const res = trackableClient.waypoint.setEvent(input);
    console.log("Waypoints updated for event", input.eventId);
    return res;
  });
