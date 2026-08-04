import { z } from "zod";

export const approvalDecisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "CHANGES_REQUESTED"]),
  reviewerNote: z.string().trim().min(1).max(500).optional(),
});

