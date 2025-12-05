import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import { Container } from 'reactstrap';
import freshaLogo from '../assets/images/Logo1.jpg';

// Import Layout Variants
import VerticalLayout from './VerticalLayouts';
import TwoColumnLayout from './TwoColumnLayout';
import HorizontalLayout from './HorizontalLayout';

const Sidebar = ({ layoutType }: any) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 🧠 Safe handler for logo clicks — prevents re-navigation to same route
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      console.log('Already on Dashboard — no navigation triggered.');
    }
  };

  // ✅ Close sidebar overlay on outside click
  useEffect(() => {
    const overlay = document.querySelector('.vertical-overlay');
    const handleOverlayClick = () => {
      document.body.classList.remove('vertical-sidebar-enable');
    };
    overlay?.addEventListener('click', handleOverlayClick);
    return () => overlay?.removeEventListener('click', handleOverlayClick);
  }, []);

  const addEventListenerOnSmHoverMenu = () => {
    const sidebarSize = document.documentElement.getAttribute('data-sidebar-size');
    if (sidebarSize === 'sm-hover') {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover-active');
    } else if (sidebarSize === 'sm-hover-active') {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    } else {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    }
  };

  return (
    <React.Fragment>
      <div className="app-menu navbar-menu">
        {/* ✅ Logo Box */}
        <div className="navbar-brand-box">
          <a href="/" onClick={handleLogoClick} className="logo logo-dark">
            <span className="logo-sm">
              <img
                src={freshaLogo}
                alt="Fresha Logo"
                height="40"
                style={{ objectFit: 'contain', maxWidth: '100%' }}
              />
            </span>
            <span className="logo-lg">
              <img
                src={freshaLogo}
                alt="Fresha Logo"
                height="40"
                style={{ objectFit: 'contain', maxWidth: '100%' }}
              />
            </span>
          </a>

          <a href="/" onClick={handleLogoClick} className="logo logo-light">
            <span className="logo-sm">
              <img
                src={freshaLogo}
                alt="Fresha Logo"
                height="40"
                style={{ objectFit: 'contain', maxWidth: '100%' }}
              />
            </span>
            <span className="logo-lg">
              <img
                src={freshaLogo}
                alt="Fresha Logo"
                height="40"
                style={{ objectFit: 'contain', maxWidth: '100%' }}
              />
            </span>
          </a>

          <button
            onClick={addEventListenerOnSmHoverMenu}
            type="button"
            className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
            id="vertical-hover"
          >
            <i className="ri-record-circle-line"></i>
          </button>
        </div>

        {/* ✅ Conditional Layout Render */}
        {layoutType === 'horizontal' ? (
          <div id="scrollbar">
            <Container fluid>
              <div id="two-column-menu"></div>
              <ul className="navbar-nav" id="navbar-nav">
                <HorizontalLayout />
              </ul>
            </Container>
          </div>
        ) : layoutType === 'twocolumn' ? (
          <>
            <TwoColumnLayout layoutType={layoutType} />
            <div className="sidebar-background"></div>
          </>
        ) : (
          <>
            <SimpleBar id="scrollbar" className="h-100">
              <Container fluid>
                <div id="two-column-menu"></div>
                <ul className="navbar-nav" id="navbar-nav">
                  <VerticalLayout layoutType={layoutType} />
                </ul>
              </Container>
            </SimpleBar>
            <div className="sidebar-background"></div>
          </>
        )}
      </div>

      {/* ✅ Sidebar overlay */}
      <div className="vertical-overlay"></div>
    </React.Fragment>
  );
};
export default Sidebar;
