'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import ThemeProvider from '@/components/ThemeProvider';
import Layout from '@/components/Layout';
import { UserRole } from '@/lib/entities/User';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemeProvider>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ThemeProvider>
      <Layout user={user}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Welcome, {user.name}! ({user.role.toUpperCase()})
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Role
                </Typography>
                <Typography variant="h5">
                  {user.role === UserRole.ADMIN ? 'Administrator' : user.role === UserRole.HOD ? 'Head of Department' : 'Faculty'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Typography variant="h6">{user.email}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Layout>
    </ThemeProvider>
  );
}
