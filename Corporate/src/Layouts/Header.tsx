import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApiGet } from "../helpers/api_helper";
import { Spinner, Badge, Button } from "reactstrap";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  Form,
} from "reactstrap";

import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";

import logoSm from "../assets/images/logo-sm.png";
import logoDark from "../assets/images/logo-dark.png";
import logoLight from "../assets/images/logo-light.png";

import SearchOption from "../Components/Common/SearchOption";
import FullScreenDropdown from "../Components/Common/FullScreenDropdown";
import ProfileDropdown from "../Components/Common/ProfileDropdown";
import LightDark from "../Components/Common/LightDark";

import { changeSidebarVisibility } from "../slices/thunks";

interface HeaderProps {
  onChangeLayoutMode: (mode: any) => void;
  layoutModeType: string;
  headerClass?: string;
  onAddAsset: () => void;
  onAddUser: () => void;
  onAddSoftware: () => void;
  isAssetOpen?: boolean;
  isUserOpen?: boolean;
  isSoftwareOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onChangeLayoutMode,
  layoutModeType,
  headerClass,
  onAddAsset,
  onAddUser,
  onAddSoftware,
  isAssetOpen = false,
  isUserOpen = false,
  isSoftwareOpen = false,
}) => {
  const dispatch = useAppDispatch();
  const sidebarVisibilitytype = useAppSelector(
    (state) => state.Layout.sidebarVisibilitytype,
  );

  const [searchOpen, setSearchOpen] = useState(false);
  const [alertDropdownOpen, setAlertDropdownOpen] = useState(false);
  const [logDropdownOpen, setLogDropdownOpen] = useState(false);

  const toggleSearch = () => setSearchOpen((prev) => !prev);
  const toggleAlertDropdown = () => setAlertDropdownOpen((prev) => !prev);
  const toggleLogDropdown = () => setLogDropdownOpen((prev) => !prev);

  const { data: alerts, isLoading: alertLoading } = useApiGet<any[]>(
    ["pending-alerts"],
    "/alerts/pending",
    {},
    true,
    { refetchInterval: 10000 },
  );

  const toggleMenuBtn = () => {
    const width = document.documentElement.clientWidth;
    const hIcon = document.querySelector(".hamburger-icon") as HTMLElement;

    dispatch(changeSidebarVisibility("show"));

    if (width > 767) hIcon?.classList.toggle("open");

    const layout = document.documentElement.getAttribute("data-layout");

    if (layout === "horizontal") {
      document.body.classList.toggle("menu");
    }

    if (
      sidebarVisibilitytype === "show" &&
      (layout === "vertical" || layout === "semibox")
    ) {
      if (width < 1025 && width > 767) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.setAttribute(
          "data-sidebar-size",
          document.documentElement.getAttribute("data-sidebar-size") === "sm"
            ? ""
            : "sm",
        );
      } else if (width > 1025) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.setAttribute(
          "data-sidebar-size",
          document.documentElement.getAttribute("data-sidebar-size") === "lg"
            ? "sm"
            : "lg",
        );
      } else {
        document.body.classList.add("vertical-sidebar-enable");
        document.documentElement.setAttribute("data-sidebar-size", "lg");
      }
    }

    if (layout === "twocolumn") {
      document.body.classList.toggle("twocolumn-panel");
    }
  };

  return (
    <header id="page-topbar" className={headerClass}>
      <div className="layout-width">
        <div className="navbar-header">
          <div className="d-flex align-items-center">
            <div className="navbar-brand-box horizontal-logo">
              <Link to="/" className="logo logo-dark">
                <span className="logo-sm">
                  <img src={logoSm} alt="" height="22" />
                </span>
                <span className="logo-lg">
                  <img src={logoDark} alt="" height="17" />
                </span>
              </Link>
              <Link to="/" className="logo logo-light">
                <span className="logo-sm">
                  <img src={logoSm} alt="" height="22" />
                </span>
                <span className="logo-lg">
                  <img src={logoLight} alt="" height="17" />
                </span>
              </Link>
            </div>

            <button
              onClick={toggleMenuBtn}
              type="button"
              className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
              id="topnav-hamburger-icon"
            >
              <span className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>

            <SearchOption />
          </div>

          <div className="d-flex align-items-center gap-2">
            <Dropdown
              isOpen={searchOpen}
              toggle={toggleSearch}
              className="d-md-none topbar-head-dropdown header-item"
            >
              <DropdownToggle
                tag="button"
                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
              >
                <i className="bx bx-search fs-22" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
                <Form className="p-3">
                  <div className="form-group m-0">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search ..."
                      />
                      <button className="btn btn-primary" type="submit">
                        <i className="mdi mdi-magnify" />
                      </button>
                    </div>
                  </div>
                </Form>
              </DropdownMenu>
            </Dropdown>

            <Dropdown isOpen={logDropdownOpen} toggle={toggleLogDropdown}>
              <DropdownToggle
                color="primary"
                caret
                className="btn btn-soft-primary"
              >
                <i className="ri-add-circle-line me-1" />
                Log Activity
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem onClick={onAddAsset} disabled={isAssetOpen}>
                  <i className="ri-computer-line me-2 text-muted" />
                  {isAssetOpen ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" />
                      Adding Asset...
                    </>
                  ) : (
                    "Add Asset"
                  )}
                </DropdownItem>
                <DropdownItem onClick={onAddUser} disabled={isUserOpen}>
                  <i className="ri-user-add-line me-2 text-muted" />
                  {isUserOpen ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" />
                      Adding User...
                    </>
                  ) : (
                    "Add User"
                  )}
                </DropdownItem>
                <DropdownItem onClick={onAddSoftware} disabled={isSoftwareOpen}>
                  <i className="ri-code-box-line me-2 text-muted" />
                  {isSoftwareOpen ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" />
                      Adding Software...
                    </>
                  ) : (
                    "Add Software"
                  )}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown isOpen={alertDropdownOpen} toggle={toggleAlertDropdown}>
              <DropdownToggle
                color="light"
                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle position-relative"
              >
                <i className="ri-notification-3-line fs-22"></i>
                {alerts && alerts.length > 0 && (
                  <Badge
                    color="danger"
                    pill
                    className="position-absolute top-0 end-0 translate-middle p-1 border border-light rounded-circle"
                  >
                    <span className="visually-hidden">New alerts</span>
                  </Badge>
                )}
              </DropdownToggle>

              <DropdownMenu end className="dropdown-menu-lg p-0">
                <div className="p-3 border-bottom">
                  <h6 className="m-0">Stock Alerts</h6>
                </div>

                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {alertLoading ? (
                    <div className="text-center p-3">
                      <Spinner size="sm" />
                    </div>
                  ) : alerts && alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <DropdownItem key={alert.id} className="py-2">
                        <div className="d-flex align-items-start gap-2">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 text-danger fw-semibold">
                              {alert.consumable || "Unknown Item"}
                            </h6>
                            <p className="mb-0 text-muted small">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      </DropdownItem>
                    ))
                  ) : (
                    <div className="text-center text-muted p-3">
                      No pending alerts.
                    </div>
                  )}
                </div>
              </DropdownMenu>
            </Dropdown>

            <FullScreenDropdown />
            <LightDark
              layoutMode={layoutModeType}
              onChangeLayoutMode={onChangeLayoutMode}
            />
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
