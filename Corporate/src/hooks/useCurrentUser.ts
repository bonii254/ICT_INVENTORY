import { useApiGet } from "../helpers/api_helper";
import { UseQueryResult } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { LOGIN_ROUTE } from "../helpers/url_helper";

export interface CurrentUser {
  id: number;
  fullname: string;
  email: string;
  role: string;
  department: string;
}

export const useCurrentUser = (
  enabled: boolean,
): UseQueryResult<CurrentUser, Error> => {
  const { pathname } = useLocation();
  const isLoginPage = pathname === LOGIN_ROUTE;

  const shouldRun = enabled && !isLoginPage;

  return useApiGet<CurrentUser>(
    ["currentUser"],
    "/verify-token",
    undefined,
    shouldRun,
  );
};
