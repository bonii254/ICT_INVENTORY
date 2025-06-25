import React from "react";
import { Routes, Route } from "react-router-dom";
import { authProtectedRoutes, publicRoutes } from "./allRoutes";
import NonAuthLayout from "../Layouts/NonAuthLayout";
import VerticalLayout from "../Layouts";
import AuthProtected from "./AuthProtected";
import { UserProvider } from "../context/UserContext";

const Index = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route>
        {publicRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={<NonAuthLayout>{route.component}</NonAuthLayout>}
          />
        ))}
      </Route>

      {/* Auth-Protected Routes */}
      <Route>
        {authProtectedRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={
              <UserProvider>
                <AuthProtected>
                  <VerticalLayout>{route.component}</VerticalLayout>
                </AuthProtected>
              </UserProvider>
            }
          />
        ))}
      </Route>
    </Routes>
  );
};

export default Index;
