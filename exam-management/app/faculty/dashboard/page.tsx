'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/lib/entities/User';
import { Box, Typography, Card, CardContent } from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Grade as GradeIcon,
} from '@mui/icons-material';

export default function FacultyDashboard() {
  return (
    <DashboardLayout role={UserRole.FACULTY}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Faculty Dashboard
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
            <Card>
              <CardContent>
                <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">Attendance Entry</Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter monthly consolidated attendance
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
            <Card>
              <CardContent>
                <GradeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">CIE Marks Entry</Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter CIE marks for students
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
