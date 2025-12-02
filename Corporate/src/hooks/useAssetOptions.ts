// src/hooks/useAssetOptions.ts
import { useApiGet } from "../helpers/api_helper";

type Option = {
  id: number;
  name?: string;
  fullname?: string;
  serial_no?: string;
  serial_number?: string;
  payroll_no?: string;
};

type SelectOption = {
  label: string;
  value: number;
};

type UseAssetOptionsReturn = {
  departments: SelectOption[] | undefined;
  locations: SelectOption[] | undefined;
  statuses: SelectOption[] | undefined;
  users: SelectOption[] | undefined;
  categories: SelectOption[] | undefined;
  roles: SelectOption[] | undefined;
  assets: SelectOption[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

/**
 * Utility function to convert a generic array of Option objects
 * into SelectOption objects for use in dropdowns.
 */
const mapToSelectOptions = (data: Option[] = []): SelectOption[] =>
  data.map((opt) => ({
    label: opt.name || opt.fullname || "Unknown",
    value: opt.id,
  }));

/**
 * Safely extracts an array from a potentially wrapped API response.
 * Example:
 *   - If API returns { assets: [...] }, returns that array.
 *   - If API returns a direct array [...], returns that array.
 *   - Otherwise, returns [].
 */
const extractArray = (data: any, key: string): Option[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
};

export const useAssetOptions = (): UseAssetOptionsReturn => {
  const {
    data: departmentsData,
    refetch: refetchDepartments,
    isLoading: loadingDept,
    isError: errorDept,
  } = useApiGet<Option[]>(["departments"], "/departments");

  const {
    data: locationsData,
    refetch: refetchLocations,
    isLoading: loadingLoc,
    isError: errorLoc,
  } = useApiGet<Option[]>(["locations"], "/locations");

  const {
    data: statusesData,
    refetch: refetchStatuses,
    isLoading: loadingStat,
    isError: errorStat,
  } = useApiGet<Option[]>(["statuses"], "/statuses");

  const {
    data: usersData,
    refetch: refetchUsers,
    isLoading: loadingUsers,
    isError: errorUsers,
  } = useApiGet<Option[]>(["users"], "/users");

  const {
    data: categoriesData,
    refetch: refetchCategories,
    isLoading: loadingCat,
    isError: errorCat,
  } = useApiGet<Option[]>(["categories"], "/categories");

  const {
    data: rolesData,
    refetch: refetchRoles,
    isLoading: loadingRoles,
    isError: errorRoles,
  } = useApiGet<Option[]>(["roles"], "/roles");

  const {
    data: assetsData,
    refetch: refetchAssets,
    isLoading: loadingAssets,
    isError: errorAssets,
  } = useApiGet<Option[]>(["assets"], "/assets");

  // ✅ Handle wrapped or direct arrays
  const assetArray = extractArray(assetsData, "assets");
  const userArray = extractArray(usersData, "users");
  const deptArray = extractArray(departmentsData, "departments");
  const locArray = extractArray(locationsData, "locations");
  const statArray = extractArray(statusesData, "statuses");
  const catArray = extractArray(categoriesData, "categories");
  const roleArray = extractArray(rolesData, "roles");

  // ✅ Build label/value pairs for dropdowns
  const assets = assetArray.map((a) => ({
    label: `${a.name || "Unnamed"} - ${a.serial_no || a.serial_number || "N/A"}`,
    value: a.id,
  }));

  const users = userArray.map((u) => ({
    label: `${u.fullname || u.name || "Unknown"} - ${u.payroll_no || "N/A"}`,
    value: u.id,
  }));

  return {
    departments: mapToSelectOptions(deptArray),
    locations: mapToSelectOptions(locArray),
    statuses: mapToSelectOptions(statArray),
    users,
    assets,
    categories: mapToSelectOptions(catArray),
    roles: mapToSelectOptions(roleArray),
    isLoading:
      loadingDept ||
      loadingLoc ||
      loadingStat ||
      loadingUsers ||
      loadingCat ||
      loadingRoles ||
      loadingAssets,
    isError:
      errorDept ||
      errorLoc ||
      errorStat ||
      errorUsers ||
      errorCat ||
      errorRoles ||
      errorAssets,
    refetch: () => {
      refetchDepartments();
      refetchLocations();
      refetchStatuses();
      refetchUsers();
      refetchCategories();
      refetchRoles();
      refetchAssets();
    },
  };
};