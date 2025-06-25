import { AssetFormValues } from "../../../types/forms";

export const formatAssetPayload = (values: AssetFormValues) => {
  return {
    category_id: Number(values.category_id),
    location_id: Number(values.location_id),
    department_id: Number(values.department_id),
    assigned_to: Number(values.assigned_to),
    purchase_date: values.purchase_date?.toISOString().split("T")[0] ?? "",
    warranty_expiry: values.warranty_expiry?.toISOString().split("T")[0] ?? "",
    configuration: values.configuration,
  };
};
