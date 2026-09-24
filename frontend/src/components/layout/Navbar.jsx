import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const isTrackPage = location.pathname.startsWith('/track/');

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* Brand */}
        <Link
          to="/"
          className="navbar-brand"
          onClick={closeMobile}
        >
          <span className="navbar-logo">
            <img src="/trashtrace.png" alt="TrashTrace Logo" />
          </span>

          <span className="navbar-brand-text">
            Trash<span>Trace</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-links">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `navbar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="navbar-link-icon">▦</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/scan"
            className={({ isActive }) =>
              `navbar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="navbar-link-icon">⌁</span>
            Scan
          </NavLink>

          {isTrackPage && (
            <span className="navbar-context">
              Tracking
            </span>
          )}

        </nav>

        {/* Desktop CTA */}
        <Link
          to="/create"
          className="navbar-cta"
        >
          <span>+</span>
          New shipment
        </Link>

        {/* Mobile Toggle */}
        <button
          type="button"
          className={`navbar-menu-button ${
            mobileOpen ? 'open' : ''
          }`}
          onClick={() => setMobileOpen((current) => !current)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
          <span />
        </button>

      </div>

      {/* Mobile Navigation */}
      <div
        className={`navbar-mobile ${
          mobileOpen ? 'open' : ''
        }`}
      >
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `navbar-mobile-link ${isActive ? 'active' : ''}`
          }
          onClick={closeMobile}
        >
          <span>▦</span>
          <div>
            <strong>Dashboard</strong>
            <small>View your shipments</small>
          </div>
        </NavLink>

        <NavLink
          to="/scan"
          className={({ isActive }) =>
            `navbar-mobile-link ${isActive ? 'active' : ''}`
          }
          onClick={closeMobile}
        >
          <span>⌁</span>
          <div>
            <strong>Scan package</strong>
            <small>Track a QR-coded package</small>
          </div>
        </NavLink>

        <NavLink
          to="/create"
          className={({ isActive }) =>
            `navbar-mobile-link navbar-mobile-create ${
              isActive ? 'active' : ''
            }`
          }
          onClick={closeMobile}
        >
          <span>+</span>
          <div>
            <strong>New shipment</strong>
            <small>Create a tracking QR code</small>
          </div>
        </NavLink>
      </div>
    </header>
  );
};

export default Navbar;