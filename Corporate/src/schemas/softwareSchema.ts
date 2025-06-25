import { z } from "zod";

export const softwareSchema = z.object({
  name: z.string().min(1, "Name is required"),
  version: z.string().optional(),
  license_key: z.string().optional(),
  expiry_date: z.string().optional(),
});
