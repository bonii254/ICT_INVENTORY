export interface AssetFormValues {
    category_id: number | string;
    location_id: number | string;
    department_id: number | string;
    assigned_to: number | string;
    purchase_date: Date | null;
    warranty_expiry: Date | null;
    configuration: string;
  }
