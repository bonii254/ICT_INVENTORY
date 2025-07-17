import { z } from "zod";

export const consumableSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .min(1, "Quantity must be at least 1"),
  unit_of_measure: z.string().min(1, "Unit of Measure is required"),
  reorder_level: z
    .number({ invalid_type_error: "Reorder level must be a number" })
    .min(0, "Reorder level cannot be negative"),
});

export type Consumable = z.infer<typeof consumableSchema>;
