import { useApiGet } from "../helpers/api_helper";

export interface AssetOption {
  id: number;
  name?: string;
  serial_number?: string;
  assigned_to?: number; // if filtering needed
}

export interface GenericOption {
  id: number;
  name?: string;
  fullname?: string;
}

export interface SelectOption {
  label: string;
  value: number;
}

const mapToAssetOptions = (data: AssetOption[] | undefined): SelectOption[] => {
  if (!Array.isArray(data)) return [];
  return (
    data
      // OPTIONAL: filter to only assets that are assigned
      // .filter((a) => a.assigned_to !== null)

      .map((item) => ({
        label: `${item.name || "Asset"}${item.serial_number ? ` - ${item.serial_number}` : ""}`,
        value: item.id,
      }))
  );
};

const mapToGenericOptions = (
  data: GenericOption[] | undefined,
): SelectOption[] => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    label: item.name || item.fullname || "Unknown",
    value: item.id,
  }));
};

export const useAssetTransferOptions = () => {
  const {
    data: assetRes,
    isLoading: loadingAssets,
    isError: errorAssets,
  } = useApiGet<{ assets: AssetOption[] }>(["assets"], "/assets");

  const {
    data: userData,
    isLoading: loadingUsers,
    isError: errorUsers,
  } = useApiGet<GenericOption[]>(["users"], "/users");

  const {
    data: locationData,
    isLoading: loadingLocations,
    isError: errorLocations,
  } = useApiGet<GenericOption[]>(["locations"], "/locations");

  return {
    assets: mapToAssetOptions(assetRes?.assets),
    users: mapToGenericOptions(userData),
    locations: mapToGenericOptions(locationData),
    isLoading: loadingAssets || loadingUsers || loadingLocations,
    isError: errorAssets || errorUsers || errorLocations,
  };
};
