import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { LOGIN_ROUTE } from "../helpers/url_helper";
import type { CurrentUser } from "../hooks/useCurrentUser";
import type { UseQueryResult } from "@tanstack/react-query";

type UserContextType = UseQueryResult<CurrentUser, Error>;

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === LOGIN_ROUTE;
  const hasRedirected = useRef(false);

  const [enableUserQuery, setEnableUserQuery] = useState(false);

  useEffect(() => {
    if (!isLoginPage) {
      const timer = setTimeout(() => {
        setEnableUserQuery(true);
      }, 4);
      return () => clearTimeout(timer);
    } else {
      setEnableUserQuery(false);
    }
  }, [isLoginPage]);

  const userQuery = useCurrentUser(enableUserQuery);
  const { isLoading, isError, data } = userQuery;

  useEffect(() => {
    if (!isLoginPage && isError && !data && !hasRedirected.current) {
      hasRedirected.current = true;
      toast.error("Session expired. Please log in again.");
      navigate(LOGIN_ROUTE, { replace: true });
    }
  }, [isError, data, isLoginPage, navigate]);

  if (!isLoginPage && isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={userQuery}>{children}</UserContext.Provider>
  );
};

export const useUser = (): UseQueryResult<CurrentUser, Error> => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
