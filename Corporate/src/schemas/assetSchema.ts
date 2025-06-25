import { z } from 'zod';

export const assetSchema = z.object({
  serial_number: z.string().min(1, 'Serial number is required'),
  model_number: z.string().min(1, 'Model number is required'),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  warranty_expiry: z.string().min(1, 'Warranty expiry is required'),
  configuration: z.string().optional(),
  department_id: z.number().min(1, 'Select department'),
  location_id: z.number().min(1, 'Select location'),
  category_id: z.number().min(1, 'Select category'),
  assigned_to: z.number().min(1, 'Assign to someone'),
  status_id: z.number().min(1, 'Select status'),
});
export type AssetFormPayload = z.infer<typeof assetSchema>;
