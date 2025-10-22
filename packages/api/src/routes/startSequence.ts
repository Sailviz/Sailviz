import { implement, ORPCError } from "@orpc/server";
import prisma from "@sailviz/db";
import { ORPCcontract } from "../contract";
import { StartSequenceStepType } from "packages/types/src/types";

const os = implement(ORPCcontract);

export const findStartSequence = os.startSequence.find.handler(
  async ({ input }) => {
    const sequence = await prisma.startSequence.findMany({
      where: { seriesId: input.seriesId },
      orderBy: { order: "asc" },
    });
    if (sequence) {
      return sequence as unknown as StartSequenceStepType[]; // prisma not fully typed for this
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  }
);

export const deleteStartSequenceStep = os.startSequence.delete.handler(
  async ({ input }) => {
    const deletedStep = await prisma.startSequence.delete({
      where: { id: input.stepId },
    });
    if (deletedStep) {
      return deletedStep as unknown as StartSequenceStepType; // prisma not fully typed for this
    } else {
      throw new ORPCError("BAD_REQUEST");
    }
  }
);

export const startSequence_update = os.startSequence.update.handler(
  async ({ input }) => {
    await prisma.$transaction(async (tx) => {
      //keep track of processed IDs
      let updateIds = [];
      for (const update of input.startSequence) {
        console.log(`Processing update: ${JSON.stringify(update)}`);
        if (update.id) {
          // Update existing entry
          const res = await tx.startSequence.update({
            where: { id: update.id },
            data: {
              time: update.time,
              name: update.name,
              order: update.order,
              hoot: update.hoot,
              flagStatus: update.flagStatus,
              fleetStart: update.fleetStart,
            },
          });
          updateIds.push(res.id);
        } else {
          // Insert new step
          const res = await tx.startSequence.create({
            data: {
              seriesId: input.seriesId,
              time: update.time,
              name: update.name,
              order: update.order,
              hoot: update.hoot,
              flagStatus: update.flagStatus,
              fleetStart: update.fleetStart,
            },
          });
          updateIds.push(res.id);
        }
      }

      await tx.startSequence.deleteMany({
        where: {
          seriesId: input.seriesId,
          id: {
            notIn: updateIds,
          },
        },
      });
    });

    console.log("Sequences updated successfully!");
    const sequence = await prisma.startSequence.findMany({
      where: { seriesId: input.seriesId },
      orderBy: { order: "asc" },
    });
    return sequence as unknown as StartSequenceStepType[]; // prisma not fully typed for this
  }
);
