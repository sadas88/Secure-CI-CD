'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/lib/entities/User';
import { DataTable, Column } from '@/components/common/DataTable';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { exportToExcel } from '@/lib/utils/excel';

interface Subject {
  id: number;
  scheme: string;
  subjectCode: string;
  subjectName: string;
  teachingDepartment: string;
  credits: number;
  maxCIE: number;
  maxSEE: number;
  totalMarks: number;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    scheme: '',
    subjectCode: '',
    subjectName: '',
    teachingDepartment: '',
    credits: '',
    maxCIE: '',
    maxSEE: '',
    totalMarks: '',
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create subject');
        setLoading(false);
        return;
      }

      setOpen(false);
      setFormData({
        scheme: '',
        subjectCode: '',
        subjectName: '',
        teachingDepartment: '',
        credits: '',
        maxCIE: '',
        maxSEE: '',
        totalMarks: '',
      });
      fetchSubjects();
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportToExcel(subjects, 'subjects', 'Subjects');
  };

  const columns: Column<Subject>[] = [
    { id: 'subjectCode', label: 'Subject Code', sortable: true },
    { id: 'subjectName', label: 'Subject Name', sortable: true },
    { id: 'scheme', label: 'Scheme', sortable: true },
    { id: 'teachingDepartment', label: 'Department', sortable: true },
    { id: 'credits', label: 'Credits', align: 'right', sortable: true },
    { id: 'maxCIE', label: 'Max CIE', align: 'right', sortable: true },
    { id: 'maxSEE', label: 'Max SEE', align: 'right', sortable: true },
    { id: 'totalMarks', label: 'Total Marks', align: 'right', sortable: true },
  ];

  return (
    <DashboardLayout role={UserRole.ADMIN}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Subjects</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Add Subject
          </Button>
        </Box>

        <DataTable
          columns={columns}
          rows={subjects}
          searchable
          exportable
          onExport={handleExport}
          mobileCard={(row) => (
            <Card>
              <CardContent>
                <Typography variant="h6">{row.subjectCode}</Typography>
                <Typography variant="body2">{row.subjectName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {row.teachingDepartment} | Credits: {row.credits}
                </Typography>
              </CardContent>
            </Card>
          )}
        />

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Subject</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                fullWidth
                label="Scheme"
                value={formData.scheme}
                onChange={(e) => setFormData({ ...formData, scheme: e.target.value })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Subject Code"
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Subject Name"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Teaching Department"
                value={formData.teachingDepartment}
                onChange={(e) => setFormData({ ...formData, teachingDepartment: e.target.value })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Credits"
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                required
                margin="normal"
                inputProps={{ step: '0.1' }}
              />
              <TextField
                fullWidth
                label="Max CIE"
                type="number"
                value={formData.maxCIE}
                onChange={(e) => setFormData({ ...formData, maxCIE: e.target.value })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Max SEE"
                type="number"
                value={formData.maxSEE}
                onChange={(e) => setFormData({ ...formData, maxSEE: e.target.value })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Total Marks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                required
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
