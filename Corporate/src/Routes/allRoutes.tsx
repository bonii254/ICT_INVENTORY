import DashboardEcommerce from "../pages/DashboardEcommerce";
import UserProfile from "../pages/Authentication/user-profile";
import MyAssetTable from "../pages/Tables/ReactTables/indexasset";
import MySoftwareTable from "pages/Tables/Softwares";
import MyConsumablesTable from "../pages/Tables/Consumables/index";
import MyAssetTransferTable from "../pages/Tables/AssetTransfer";
import Login from "../pages/Authentication/Login";
import Register from "../pages/Authentication/Register";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import Logout from "../pages/Authentication/Logout";
import { Navigate } from "react-router-dom";
import { DASHBOARD_ROUTE, LOGIN_ROUTE } from "../helpers/url_helper";

const withAuth = (Component: React.ReactElement) => Component;

const authProtectedRoutes = [
  { path: "/dashboard", component: withAuth(<DashboardEcommerce />) },
  { path: "/assets", component: withAuth(<MyAssetTable />) },
  { path: "/softwares", component: withAuth(<MySoftwareTable />) },
  { path: "/transfers", component: withAuth(<MyAssetTransferTable />) },
  { path: "/consumables", component: withAuth(<MyConsumablesTable />) },
  { path: "/profile", component: withAuth(<UserProfile />) },
  { path: "/", exact: true, component: <Navigate to={DASHBOARD_ROUTE} /> },
  { path: "*", component: <Navigate to={DASHBOARD_ROUTE} /> },
];

const publicRoutes = [
  { path: "/login", component: <Login /> },
  { path: "/register", component: <Register /> },
  { path: "/forgot-password", component: <ForgetPasswordPage /> },
  { path: "/logout", component: <Logout /> },
];

export { authProtectedRoutes, publicRoutes };
