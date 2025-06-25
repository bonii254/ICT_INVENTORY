import { useApiGet } from "../helpers/api_helper";

export interface Asset {
  id: number;
  name: string;
  "asset tag": string;
  serial_number: string;
  model: string;
  category: string | null;
  assigned_to: string | null;
  location: string | null;
  department: string | null;
  status: string | null;
  purchase_date: string;
  warranty_expiry: string;
  configuration: string;
  created_at: string;
  updated_at: string;
}

export interface AssetApiResponse {
  assets: Asset[];
  total: number;
}
export const useGetAssets = () =>
  useApiGet<AssetApiResponse>(["assets"], "/assets");
