import { createTheme } from "@mui/material";
import { lightGreen } from "@mui/material/colors";
import { ThemeProvider } from "@mui/system";

import { useKeycloak } from "@react-keycloak/web";
import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./Header";
import FileListComp from "./protected/FileListComp";

function Dashboard() {
  const { keycloak } = useKeycloak();

  const [currentUser] = useState(keycloak.tokenParsed.preferred_username);
  const theme = createTheme({
    palette: {
      primary: lightGreen,
      secondary: {
        main: "#357a38",
      },
    },
    typography: {
      fontSize: 12,
    },
    components: {
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: lightGreen[200],
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          text: {
            color: "#357a38",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          },
        },
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Header
        currentUser={currentUser}
        handleLogout={() => keycloak.logout()}
      />
      <Routes>
        <Route path="/" element={<FileListComp />} />
      </Routes>
    </ThemeProvider>
  );
}

export default Dashboard;
