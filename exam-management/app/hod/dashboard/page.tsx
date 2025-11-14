'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/lib/entities/User';
import { Box, Typography, Card, CardContent } from '@mui/material';
import {
  People as PeopleIcon,
  Class as ClassIcon,
  Subject as SubjectIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

export default function HoDDashboard() {
  return (
    <DashboardLayout role={UserRole.HOD}>
      <Box>
        <Typography variant="h4" gutterBottom>
          HoD Dashboard
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <Card>
              <CardContent>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">Students</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage student details
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <Card>
              <CardContent>
                <ClassIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">Classes</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage classes
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <Card>
              <CardContent>
                <SubjectIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">Mappings</Typography>
                <Typography variant="body2" color="text.secondary">
                  Subject-Faculty & Class-Subject
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <Card>
              <CardContent>
                <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">Reports</Typography>
                <Typography variant="body2" color="text.secondary">
                  View consolidated reports
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
