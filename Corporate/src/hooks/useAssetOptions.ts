// src/hooks/useAssetOptions.ts
import { useApiGet } from ".././helpers/api_helper";

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
  isLoading: boolean;
  isError: boolean;
};

const mapToSelectOptions = (data: Option[] = []): SelectOption[] =>
  data.map((opt) => ({
    label: opt.name || opt.fullname || `Unknown`,
    value: opt.id,
  }));

export const useAssetOptions = (): UseAssetOptionsReturn => {
  const {
    data: departmentsData,
    isLoading: loadingDept,
    isError: errorDept,
  } = useApiGet<Option[]>(["departments"], "/departments");

  const {
    data: locationsData,
    isLoading: loadingLoc,
    isError: errorLoc,
  } = useApiGet<Option[]>(["locations"], "/locations");

  const {
    data: statusesData,
    isLoading: loadingStat,
    isError: errorStat,
  } = useApiGet<Option[]>(["statuses"], "/statuses");

  const {
    data: usersData,
    isLoading: loadingUsers,
    isError: errorUsers,
  } = useApiGet<Option[]>(["users"], "/users");

  const {
    data: categoriesData,
    isLoading: loadingCat,
    isError: errorCat,
  } = useApiGet<Option[]>(["categories"], "/categories");

  return {
    departments: mapToSelectOptions(departmentsData),
    locations: mapToSelectOptions(locationsData),
    statuses: mapToSelectOptions(statusesData),
    users: mapToSelectOptions(usersData),
    categories: mapToSelectOptions(categoriesData),
    isLoading:
      loadingDept || loadingLoc || loadingStat || loadingUsers || loadingCat,
    isError: errorDept || errorLoc || errorStat || errorUsers || errorCat,
  };
};
