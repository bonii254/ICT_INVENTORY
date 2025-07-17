import React, { useEffect, useState, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import withRouter from "../Components/Common/withRouter";

// Import Layout components
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import RightSidebar from "../Components/Common/RightSidebar";

// Redux setup
import {
  changeLayout,
  changeSidebarTheme,
  changeLayoutMode,
  changeLayoutWidth,
  changeLayoutPosition,
  changeTopbarTheme,
  changeLeftsidebarSizeType,
  changeLeftsidebarViewType,
  changeSidebarImageType,
  changeSidebarVisibility,
} from "../slices/thunks";

import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";

// Lazy-loaded modals
const AddAssetModal = lazy(() => import("../Components/Common/AssetForm"));
const AddUserModal = lazy(
  () => import("../Components/Common/Custom/User/AddUserModal"),
);
const AddSoftwareModal = lazy(
  () => import("../Components/Common/Custom/Software/AddSoftwareModel"),
);

const Layout = (props: any) => {
  const [headerClass, setHeaderClass] = useState("");
  const dispatch: any = useDispatch();

  // Modal State
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [softwareModalOpen, setSoftwareModalOpen] = useState(false);

  const toggleAssetModal = () => setAssetModalOpen((prev) => !prev);
  const toggleUserModal = () => setUserModalOpen((prev) => !prev);
  const toggleSoftwareModal = () => setSoftwareModalOpen((prev) => !prev);

  // Layout selector
  const selectLayoutProperties = createSelector(
    (state: any) => state.Layout,
    (layout) => ({
      layoutType: layout.layoutType,
      leftSidebarType: layout.leftSidebarType,
      layoutModeType: layout.layoutModeType,
      layoutWidthType: layout.layoutWidthType,
      layoutPositionType: layout.layoutPositionType,
      topbarThemeType: layout.topbarThemeType,
      leftsidbarSizeType: layout.leftsidbarSizeType,
      leftSidebarViewType: layout.leftSidebarViewType,
      leftSidebarImageType: layout.leftSidebarImageType,
      sidebarVisibilitytype: layout.sidebarVisibilitytype,
    }),
  );

  const {
    layoutType,
    leftSidebarType,
    layoutModeType,
    layoutWidthType,
    layoutPositionType,
    topbarThemeType,
    leftsidbarSizeType,
    leftSidebarViewType,
    leftSidebarImageType,
    sidebarVisibilitytype,
  } = useSelector(selectLayoutProperties);

  // Apply layout settings
  useEffect(() => {
    dispatch(changeLeftsidebarViewType(leftSidebarViewType));
    dispatch(changeLeftsidebarSizeType(leftsidbarSizeType));
    dispatch(changeSidebarTheme(leftSidebarType));
    dispatch(changeLayoutMode(layoutModeType));
    dispatch(changeLayoutWidth(layoutWidthType));
    dispatch(changeLayoutPosition(layoutPositionType));
    dispatch(changeTopbarTheme(topbarThemeType));
    dispatch(changeLayout(layoutType));
    dispatch(changeSidebarImageType(leftSidebarImageType));
    dispatch(changeSidebarVisibility(sidebarVisibilitytype));
    window.dispatchEvent(new Event("resize"));
  }, [
    layoutType,
    leftSidebarType,
    layoutModeType,
    layoutWidthType,
    layoutPositionType,
    topbarThemeType,
    leftsidbarSizeType,
    leftSidebarViewType,
    leftSidebarImageType,
    sidebarVisibilitytype,
    dispatch,
  ]);

  // Sticky header shadow
  useEffect(() => {
    window.addEventListener("scroll", () => {
      setHeaderClass(
        document.documentElement.scrollTop > 50 ? "topbar-shadow" : "",
      );
    });
  }, []);

  // Sync hamburger icon based on sidebar visibility
  useEffect(() => {
    const humberIcon = document.querySelector(".hamburger-icon") as HTMLElement;
    if (!humberIcon) return;
    if (
      sidebarVisibilitytype === "show" ||
      layoutType === "vertical" ||
      layoutType === "twocolumn"
    ) {
      humberIcon.classList.remove("open");
    } else {
      humberIcon.classList.add("open");
    }
  }, [sidebarVisibilitytype, layoutType]);

  const onChangeLayoutMode = (value: any) => {
    dispatch(changeLayoutMode(value));
  };

  return (
    <>
      <div id="layout-wrapper">
        <Header
          headerClass={headerClass}
          layoutModeType={layoutModeType}
          onChangeLayoutMode={onChangeLayoutMode}
          onAddAsset={toggleAssetModal}
          onAddUser={toggleUserModal}
          onAddSoftware={toggleSoftwareModal}
        />

        <Sidebar layoutType={layoutType} />

        <div className="main-content">
          {props.children}
          <Footer />
        </div>
      </div>

      <RightSidebar />

      {/* Suspense Modals */}
      <Suspense
        fallback={<div className="text-center p-3">Loading modal...</div>}
      >
        {assetModalOpen && <AddAssetModal isOpen onClose={toggleAssetModal} />}
        {userModalOpen && <AddUserModal isOpen onClose={toggleUserModal} />}
        {softwareModalOpen && (
          <AddSoftwareModal isOpen onClose={toggleSoftwareModal} />
        )}
      </Suspense>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.object,
};

export default withRouter(Layout);
