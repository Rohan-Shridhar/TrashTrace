import { Link, NavLink } from "react-router-dom";

function Navbar() {
  const navigation = [
    {
      to: "/dashboard",
      label: "Dashboard",
    },
    {
      to: "/create",
      label: "Create shipment",
    },
    {
      to: "/scan",
      label: "Scan",
    },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            T
          </span>

          <span className="brand-name">
            TrashTrace
          </span>
        </Link>

        <nav className="navbar-navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `navbar-link ${
                  isActive ? "navbar-link-active" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <Link
            to="/create"
            className="navbar-create-button"
          >
            New shipment
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;