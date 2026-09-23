import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

const Home = lazy(() => import("../pages/Home/Home"));
const CreateShipment = lazy(
  () => import("../pages/CreateShipment/CreateShipment")
);
const TrackShipment = lazy(
  () => import("../pages/TrackShipment/TrackShipment")
);
const ScanQR = lazy(() => import("../pages/ScanQR/ScanQR"));
const Dashboard = lazy(
  () => import("../pages/Dashboard/Dashboard")
);

export const appRoutes = (
  <Route element={<AppLayout />}>
    <Route path="/" element={<Home />} />

    <Route path="/create" element={<CreateShipment />} />

    <Route
      path="/track/:trackingId"
      element={<TrackShipment />}
    />

    <Route path="/scan" element={<ScanQR />} />

    <Route path="/dashboard" element={<Dashboard />} />

    <Route
      path="*"
      element={<Navigate to="/" replace />}
    />
  </Route>
);