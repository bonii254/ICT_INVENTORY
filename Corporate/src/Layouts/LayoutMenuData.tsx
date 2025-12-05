import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navdata = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const updateIconSidebar = (e: any) => {
    if (e?.target?.getAttribute('sub-items')) {
      const ul: any = document.getElementById('two-column-menu');
      const iconItems: any = ul.querySelectorAll('.nav-icon.active');
      iconItems.forEach((item: any) => {
        item.classList.remove('active');
        const id = item.getAttribute('sub-items');
        const subMenu = document.getElementById(id);
        if (subMenu) subMenu.classList.remove('show');
      });
    }
  };

  const menuItems: any[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'ri-dashboard-2-line',
      link: '/dashboard',
      click: (e: any) => {
        e.preventDefault();
        // Only navigate if not already on Dashboard
        if (location.pathname !== '/dashboard') {
          navigate('/dashboard');
        }
      },
    },
    {
      id: 'assets',
      label: 'Assets',
      icon: 'ri-computer-line',
      link: '/assets',
    },
    {
      id: 'assetloans',
      label: 'Asset Loans',
      icon: 'ri-handbag-line',
      link: '/asset-loans',
    },
    {
      id: 'externalservices',
      label: 'External Services',
      icon: 'ri-tools-line',
      link: '/external-services',
    },
    {
      id: 'consumables',
      label: 'Consumables',
      icon: 'ri-drop-line',
      link: '/consumables',
    },
    {
      id: 'transfers',
      label: 'Transfers',
      icon: 'ri-exchange-line',
      link: '/transfers',
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: 'ri-customer-service-2-line',
      link: '/tickets',
    },
    {
      id: 'softwares',
      label: 'Softwares',
      icon: 'ri-macbook-line',
      link: '/softwares',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'ri-bar-chart-box-line',
      link: '/reports',
    },
    {
      label: 'Settings',
      isHeader: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'ri-settings-3-line',
      link: '/#',
      click: (e: any) => {
        e.preventDefault();
        setIsSettingsOpen(!isSettingsOpen);
        updateIconSidebar(e);
      },
      subItems: [
        { id: 'users', label: 'Users', link: '/settings/users' },
        { id: 'locations', label: 'Locations', link: '/settings/locations' },
        { id: 'categories', label: 'Categories', link: '/settings/categories' },
        { id: 'departments', label: 'Departments', link: '/settings/departments' },
        { id: 'statuses', label: 'Statuses', link: '/settings/statuses' },
        { id: 'roles', label: 'Roles', link: '/settings/roles' },
        { id: 'providers', label: 'Service Providers', link: '/settings/providers' },
      ],
      stateVariables: isSettingsOpen,
    },
  ];

  return <>{menuItems}</>;
};

export default Navdata;
