import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { QueryClient, QueryClientProvider } from "react-query";

import PrivateRoute from "./PrivateRoute";
import Home from "./Home";
import Dashboard from "./Dashboard";
import keycloak from "./keycloak";
import {InfoProvider} from "./InfoProvider";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css'

function App() {
  const queryClient = new QueryClient();

  return (
    <InfoProvider>
    <QueryClientProvider client={queryClient}>
      <ReactKeycloakProvider authClient={keycloak}>
        <React.StrictMode>
          <Router>
            <Routes>
              <Route exact path="/app" element={<Home />} />
              <Route exact path="/" element={<Home />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </React.StrictMode>
      </ReactKeycloakProvider>
    </QueryClientProvider>
    </InfoProvider>
  );
}

export default App;
