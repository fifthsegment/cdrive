import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Box,
  } from "@mui/material";
  import { AccountCircle } from "@mui/icons-material";
  import { useState } from "react";
  import { Logo } from "./Logo";
  import { lightBlue } from "@mui/material/colors";
  
  function Header({ currentUser, handleLogout }) {
    const [anchorEl, setAnchorEl] = useState(null);
  
    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            <div style={{width: 100}}>
              <Logo/>
            </div>
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
            }}
          >
            <div id="search-container"></div>
            
          </Box>
          <Typography onClick={handleMenuOpen}>{currentUser}</Typography>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
          >
            <AccountCircle color="red" />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    );
  }
  
  export default Header;
  