import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import avatar1 from "../../assets/images/users/avatar-1.jpg";
import { useUser } from "../../context/UserContext";
import { useApiPost } from "../../helpers/api_helper";
import { LOGIN_ROUTE } from "../../helpers/url_helper";

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const toggleProfileDropdown = () => setIsProfileDropdown((prev) => !prev);

  const { data: userData } = useUser();
  const userName = userData?.fullname || "Admin";
  const userRole = userData?.role || "User";

  const { mutate: logout } = useApiPost<null, void>(
    "/auth/logout",
    () => {
      localStorage.removeItem("authUser");
      sessionStorage.clear();
      navigate(LOGIN_ROUTE, { replace: true });
    },
    (error) => {
      console.error("Logout failed:", error.message);
    },
  );

  return (
    <React.Fragment>
      <Dropdown
        isOpen={isProfileDropdown}
        toggle={toggleProfileDropdown}
        className="ms-sm-3 header-item topbar-user"
      >
        <DropdownToggle tag="button" type="button" className="btn">
          <span className="d-flex align-items-center">
            <img
              className="rounded-circle header-profile-user"
              src={avatar1}
              alt="Header Avatar"
            />
            <span className="text-start ms-xl-2">
              <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                {userName}
              </span>
              <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
                {userRole}
              </span>
            </span>
          </span>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <h6 className="dropdown-header">Welcome {userName}!</h6>

          <DropdownItem className="p-0">
            <Link to="/profile" className="dropdown-item">
              <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
              <span className="align-middle">Profile</span>
            </Link>
          </DropdownItem>

          <div className="dropdown-divider" />

          <DropdownItem className="p-0">
            <Link to="/auth-lockscreen-basic" className="dropdown-item">
              <i className="mdi mdi-lock text-muted fs-16 align-middle me-1"></i>
              <span className="align-middle">Lock screen</span>
            </Link>
          </DropdownItem>

          <DropdownItem
            onClick={() => logout()}
            className="dropdown-item"
            style={{ cursor: "pointer" }}
          >
            <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
            <span className="align-middle" data-key="t-logout">
              Logout
            </span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default ProfileDropdown;
