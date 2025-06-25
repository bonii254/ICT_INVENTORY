import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navdata = () => {
  const history = useNavigate();
  //state data
  const [isDashboard, setIsDashboard] = useState<boolean>(false);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isPages, setIsPages] = useState<boolean>(false);

  const [isSettings, setIsSettings] = useState<boolean>(false);
  const [iscurrentState, setIscurrentState] = useState("Dashboard");

  function updateIconSidebar(e: any) {
    if (e && e.target && e.target.getAttribute("sub-items")) {
      const ul: any = document.getElementById("two-column-menu");
      const iconItems: any = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        var id = item.getAttribute("sub-items");
        const getID = document.getElementById(id) as HTMLElement;
        if (getID) getID.classList.remove("show");
      });
    }
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "Dashboard") {
      setIsDashboard(false);
    }
    if (iscurrentState !== "Auth") {
      setIsAuth(false);
    }
    if (iscurrentState !== "Pages") {
      setIsPages(false);
    }
    if (iscurrentState !== "Assets") {
      setIsPages(false);
    }
    if (iscurrentState === "Widgets") {
      history("/widgets");
      document.body.classList.add("twocolumn-panel");
    }
  }, [history, iscurrentState, isDashboard, isAuth, isPages]);

  const menuItems: any = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "ri-dashboard-2-line",
      link: "/dashboard",
      click: function (e: any) {
        e.preventDefault();
        setIscurrentState("Dashboard");
      },
    },
    {
      id: "assets",
      label: "Assets",
      icon: "ri-computer-line",
      link: "/assets",
    },
    {
      id: "consumables",
      label: "Consumables",
      icon: "ri-drop-line",
      link: "/consumables",
    },
    {
      id: "transfers",
      label: "Transfers",
      icon: "ri-exchange-line",
      link: "/transfers",
    },
    {
      id: "tickets",
      label: "Tickets",
      icon: "ri-customer-service-2-line",
      link: "/tickets",
    },
    {
      id: "softwares",
      label: "Softwares",
      icon: "ri-macbook-line",
      link: "/softwares",
    },
    {
      id: "reports",
      label: "Reports",
      icon: "ri-bar-chart-box-line",
      link: "/reports",
    },
    {
      label: "Settings",
      isHeader: true,
    },
    {
      id: "settings",
      label: "Settings",
      icon: "ri-settings-3-line",
      link: "/#",
      stateVariables: isSettings,
      click: function (e: any) {
        e.preventDefault();
        setIsSettings(!isSettings);
        setIscurrentState("Settings");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "users",
          label: "Users",
          link: "/settings/users",
          parentId: "settings",
        },
        {
          id: "locations",
          label: "Locations",
          link: "/settings/locations",
          parentId: "settings",
        },
        {
          id: "categories",
          label: "Categories",
          link: "/settings/categories",
          parentId: "settings",
        },
        {
          id: "departments",
          label: "Departments",
          link: "/settings/departments",
          parentId: "settings",
        },
        {
          id: "statuses",
          label: "Statuses",
          link: "/settings/statuses",
          parentId: "settings",
        },
        {
          id: "roles",
          label: "Roles",
          link: "/settings/roles",
          parentId: "settings",
        },
      ],
    },
  ];
  return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
