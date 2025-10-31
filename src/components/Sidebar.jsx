import React from 'react';
import { NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AddBoxIcon from '@mui/icons-material/AddBox';
import KitchenIcon from '@mui/icons-material/Kitchen';
import { Box, Tooltip } from '@mui/material';

export default function Sidebar() {
   return (
      <Box component="nav" className="app-sidebar">
         <div className="brand">
            <div className="logo">🍳</div>
            <div className="brand-title">RecipeLab</div>
         </div>

         <div className="nav-links">
            <Tooltip title="Recipes" placement="right">
               <NavLink to="/recipes" className="nav-item" end>
                  <HomeIcon />
                  <span>Recipes</span>
               </NavLink>
            </Tooltip>

            <Tooltip title="Create" placement="right">
               <NavLink to="/create" className="nav-item">
                  <AddBoxIcon />
                  <span>Create</span>
               </NavLink>
            </Tooltip>

            <Tooltip title="Current Session" placement="right">
               <NavLink to="/cook" className="nav-item">
                  <KitchenIcon />
                  <span>Session</span>
               </NavLink>
            </Tooltip>
         </div>

         <div className="sidebar-footer">
            <small>RecipeLab <center>© 2024 </center></small>
         </div>
      </Box>
   );
}
