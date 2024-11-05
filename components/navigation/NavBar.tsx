import React from 'react';
import { IconButton, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '1rem 0',
        backgroundColor: '#6F969E',
        position: 'fixed',
        bottom: 0,
        width: '100%',
      }}
    >
      <IconButton aria-label="home">
        <HomeIcon style={{ color: 'black', fontSize: 'large' }} />
      </IconButton>
      <IconButton aria-label="location">
        <LocationOnIcon style={{ color: 'black', fontSize: 'large' }} />
      </IconButton>
      <Box
        sx={{
          backgroundColor: '#B3B3B3',
          borderRadius: '50%',
          padding: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <IconButton aria-label="add">
          <AddIcon style={{ color: 'black', fontSize: 'large' }} />
        </IconButton>
      </Box>
      <IconButton aria-label="book">
        <MenuBookIcon style={{ color: 'black', fontSize: 'large' }} />
      </IconButton>
      <IconButton aria-label="profile">
        <AccountCircleIcon style={{ color: 'black', fontSize: 'large' }} />
      </IconButton>
    </Box>
  );
};

export default Navbar;

// HOW TO USE ON PAGES (if ever doing individually)
//import NavBar from '../components/NavBar';
// <div>
// <h1>Home Page Content</h1>
// <Navbar />
// </div>