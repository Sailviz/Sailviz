import { z } from "zod";

import * as Types from "@sailviz/types";
import { oc } from "@orpc/contract";

export const TrackableContract = {
  waypoint: {
    create: oc
      .input(
        z.object({
          eventId: z.string(),
          lat: z.number(),
          lon: z.number(),
          name: z.string(),
          radius: z.number(),
          sequence: z.number(),
        })
      )
      .output(Types.WaypointSchema),
    update: oc
      .input(
        z.object({
          waypointId: z.string(),
          lat: z.number(),
          lon: z.number(),
          name: z.string(),
          radius: z.number(),
          sequence: z.number(),
        })
      )
      .output(Types.WaypointSchema),
    delete: oc
      .input(z.object({ waypointId: z.string() }))
      .output(Types.WaypointSchema),
    all: oc
      .input(z.object({ eventId: z.string() }))
      .output(z.array(Types.WaypointSchema)),
    find: oc
      .input(z.object({ waypointId: z.string() }))
      .output(Types.WaypointSchema),
  },
  device: {
    create: oc.input(z.object({ id: z.string(), productId: z.string() })),
    adopt: oc.input(z.object({ id: z.string(), orgId: z.string() })),
    update: oc.input(z.object({ id: z.string(), name: z.string() })),
    all: oc
      .input(z.object({ orgId: z.string() }))
      .output(z.array(Types.DeviceSchema)),
    find: oc.input(z.string()).output(Types.DeviceSchema),
    positions: oc
      .input(z.object({ deviceId: z.string(), range: z.string() }))
      .output(z.array(Types.PositionSchema)),
  },
  event: {
    create: oc.input(z.object({ name: z.string(), orgId: z.string() })),
    update: oc.input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        eventType: z.number().optional(),
        isSailviz: z.boolean().optional(),
        loop: z.boolean().optional(),
      })
    ),
    all: oc
      .input(z.object({ orgId: z.string() }))
      .output(z.array(Types.TEventSchema)),
    find: oc.input(z.object({ orgId: z.string() })).output(Types.TEventSchema),
  },
  tracker: {
    find: oc.input(z.string()).output(Types.TrackerSchema),
  },
  participant: {
    create: oc.input(z.object({ eventId: z.string(), deviceId: z.string() })),
  },
};
