// src/hooks/useAssetOptions.ts
import { useApiGet } from "../helpers/api_helper";

type Option = {
  id: number;
  name?: string;
  fullname?: string;
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
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

const mapToSelectOptions = (data: Option[] = []): SelectOption[] =>
  data.map((opt) => ({
    label: opt.name || opt.fullname || `Unknown`,
    value: opt.id,
  }));

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

  return {
    departments: mapToSelectOptions(departmentsData),
    locations: mapToSelectOptions(locationsData),
    statuses: mapToSelectOptions(statusesData),
    users: mapToSelectOptions(usersData),
    categories: mapToSelectOptions(categoriesData),
    roles: mapToSelectOptions(rolesData),
    isLoading:
      loadingDept ||
      loadingLoc ||
      loadingStat ||
      loadingUsers ||
      loadingCat ||
      loadingRoles,
    isError:
      errorDept ||
      errorLoc ||
      errorStat ||
      errorUsers ||
      errorCat ||
      errorRoles,
    refetch: () => {
      refetchDepartments();
      refetchLocations();
      refetchStatuses();
      refetchUsers();
      refetchCategories();
      refetchRoles();
    },
  };
};
