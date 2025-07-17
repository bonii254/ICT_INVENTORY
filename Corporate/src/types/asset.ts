export interface AssetPayload {
  category_id: number;
  location_id: number;
  department_id: number;
  assigned_to: number;
  purchase_date: string;
  warranty_expiry: string;
  configuration: string;
}

export interface Asset extends AssetPayload {
  id: number;
}

export interface AssetsState {
  assets: Asset[];
  categories: any[];
  departments: any[];
  locations: any[];
  users: any[];
  loading: boolean;
  error: string | null;
}

export type Asset2 = {
  id: number;
  name: string;
  serial_number: string;
  model: string;
  category: string;
  assigned_to: string;
  department: string;
  status: string;
  created_at: string;
};
