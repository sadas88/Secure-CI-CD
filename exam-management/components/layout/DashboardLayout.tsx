'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Subject as SubjectIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { UserRole } from '@/lib/entities/User';

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const getMenuItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: `/${role}/dashboard` },
    ];

    if (role === UserRole.ADMIN) {
      return [
        ...baseItems,
        { text: 'Subjects', icon: <SubjectIcon />, path: '/admin/subjects' },
        { text: 'Faculty', icon: <PeopleIcon />, path: '/admin/faculty' },
        { text: 'Branches', icon: <SchoolIcon />, path: '/admin/branches' },
        { text: 'Semesters', icon: <ClassIcon />, path: '/admin/semesters' },
      ];
    }

    if (role === UserRole.HOD) {
      return [
        ...baseItems,
        { text: 'Subject-Faculty Mapping', icon: <SubjectIcon />, path: '/hod/subject-faculty' },
        { text: 'Students', icon: <PersonIcon />, path: '/hod/students' },
        { text: 'Classes', icon: <ClassIcon />, path: '/hod/classes' },
        { text: 'Class-Subject Mapping', icon: <SubjectIcon />, path: '/hod/class-subject' },
        { text: 'Consolidated Attendance', icon: <BarChartIcon />, path: '/hod/consolidated-attendance' },
        { text: 'Low Attendance/CIE Report', icon: <AssessmentIcon />, path: '/hod/reports' },
      ];
    }

    if (role === UserRole.FACULTY) {
      return [
        ...baseItems,
        { text: 'Attendance Entry', icon: <AssessmentIcon />, path: '/faculty/attendance' },
        { text: 'CIE Marks Entry', icon: <AssessmentIcon />, path: '/faculty/cie-marks' },
      ];
    }

    return baseItems;
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Exam Management
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Government Polytechnic, Mangaluru
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">{user?.name}</Typography>
            <IconButton onClick={handleMenuClick} size="small">
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
