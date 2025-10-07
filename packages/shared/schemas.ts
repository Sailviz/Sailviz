import { z } from "zod";

export const ClubIdSchema = z.object({
  clubId: z.string(),
});
