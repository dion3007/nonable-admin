import { Icon } from '@iconify/react';
import { useRef, useState, useEffect } from 'react';
import homeFill from '@iconify/icons-eva/home-fill';
import personFill from '@iconify/icons-eva/person-fill';
import settings2Fill from '@iconify/icons-eva/settings-2-fill';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material
import { alpha } from '@material-ui/core/styles';
import { Button, Box, Divider, MenuItem, Typography, Avatar, IconButton } from '@material-ui/core';
// components
import MenuPopover from '../../components/MenuPopover';
//
import account from '../../_mocks_/account';
import firebase from '../../firebase';
import { authDataGet, authLogout } from '../../utils/cache';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: homeFill,
    linkTo: '/'
  },
  {
    label: 'Profile',
    icon: personFill,
    linkTo: '#'
  },
  {
    label: 'Settings',
    icon: settings2Fill,
    linkTo: '/dashboard/settings?act=Edit'
  }
];

const MENU_OPTIONS_ADMIN = [
  {
    label: 'Home',
    icon: homeFill,
    linkTo: '/'
  },
  {
    label: 'Profile',
    icon: personFill,
    linkTo: '#'
  }
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!auth) setAuth(authDataGet());
  }, [auth]);

  const handleLogout = () => {
    authLogout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72)
            }
          })
        }}
      >
        <Avatar src={account.photoURL} alt="photoURL" />
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 220 }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle1" noWrap>
            {auth?.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {auth?.email}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />
        {auth?.role === 'admin' && 'Admin'
          ? MENU_OPTIONS_ADMIN.map((option) => (
              <MenuItem
                key={option.label}
                to={option.linkTo}
                component={RouterLink}
                onClick={handleClose}
                sx={{ typography: 'body2', py: 1, px: 2.5 }}
              >
                <Box
                  component={Icon}
                  icon={option.icon}
                  sx={{
                    mr: 2,
                    width: 24,
                    height: 24
                  }}
                />

                {option.label}
              </MenuItem>
            ))
          : MENU_OPTIONS.map((option) => (
              <MenuItem
                key={option.label}
                to={option.linkTo}
                component={RouterLink}
                onClick={handleClose}
                sx={{ typography: 'body2', py: 1, px: 2.5 }}
              >
                <Box
                  component={Icon}
                  icon={option.icon}
                  sx={{
                    mr: 2,
                    width: 24,
                    height: 24
                  }}
                />

                {option.label}
              </MenuItem>
            ))}

        <Box sx={{ p: 2, pt: 1.5 }}>
          <Button onClick={handleLogout} fullWidth color="inherit" variant="outlined">
            Logout
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}
