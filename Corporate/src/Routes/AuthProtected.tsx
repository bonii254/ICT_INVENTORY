import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { LOGIN_ROUTE } from "../helpers/url_helper";

const AuthProtected: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) return null;

  //if (!user) {
  //  return <Navigate to={LOGIN_ROUTE} replace state={{ from: location }} />;
  // }

  return <>{children}</>;
};

export default AuthProtected;
