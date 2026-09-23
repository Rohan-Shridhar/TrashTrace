import { Suspense } from "react";
import { Routes } from "react-router-dom";

import { AppProviders } from "./providers";
import { appRoutes } from "./routes";

function App() {
  return (
    <AppProviders>
      <Suspense
        fallback={
          <div className="app-loading">
            <div className="loading-spinner" />
            <span>Loading...</span>
          </div>
        }
      >
        <Routes>
          {appRoutes}
        </Routes>
      </Suspense>
    </AppProviders>
  );
}

export default App;