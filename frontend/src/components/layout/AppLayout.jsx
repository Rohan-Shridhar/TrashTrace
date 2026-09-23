import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";

function AppLayout() {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;