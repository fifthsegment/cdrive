import { useKeycloak } from "@react-keycloak/web";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lightGreen } from "@mui/material/colors";
import { Button, Typography } from "@mui/material";
import { Logo } from "./Logo";

function Home() {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();

  const authenticated = keycloak.authenticated;

  useEffect(() => {
    if (authenticated === true) {
      navigate("/dashboard");
    } else {
      setTimeout(() => {
        const url = keycloak.createLoginUrl();
        window.location.replace(url);
      }, 3000);
    }
  }, [authenticated, keycloak, navigate]);

  return (
    <div
      style={{ background: lightGreen[500], width: "100%", height: "100vh" }}
    >
      <div
        style={{
          textAlign: "center",
          position: "relative",
          top: "calc(50vh - 100px)",
          color: "white"
        }}
      >
        <div>
          <div style={{width: "20vw", margin: "0 auto", marginBottom: 20}} >
          <Logo />
          </div>
          <Typography variant="h6">Redirecting...</Typography>
        </div>
        <div>
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#fff"
          >
            <g fill="none" fill-rule="evenodd" stroke-width="2">
              <circle cx="22" cy="22" r="1">
                <animate
                  attributeName="r"
                  begin="0s"
                  dur="1.8s"
                  values="1; 20"
                  calcMode="spline"
                  keyTimes="0; 1"
                  keySplines="0.165, 0.84, 0.44, 1"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-opacity"
                  begin="0s"
                  dur="1.8s"
                  values="1; 0"
                  calcMode="spline"
                  keyTimes="0; 1"
                  keySplines="0.3, 0.61, 0.355, 1"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="22" cy="22" r="1">
                <animate
                  attributeName="r"
                  begin="-0.9s"
                  dur="1.8s"
                  values="1; 20"
                  calcMode="spline"
                  keyTimes="0; 1"
                  keySplines="0.165, 0.84, 0.44, 1"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-opacity"
                  begin="-0.9s"
                  dur="1.8s"
                  values="1; 0"
                  calcMode="spline"
                  keyTimes="0; 1"
                  keySplines="0.3, 0.61, 0.355, 1"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </svg>
        </div>
        {!useKeycloak.authenticated && (
          <Button variant="primary" onClick={() => keycloak.login()}>
            Click to login
          </Button>
        )}
      </div>
    </div>
  );
}

export default Home;
