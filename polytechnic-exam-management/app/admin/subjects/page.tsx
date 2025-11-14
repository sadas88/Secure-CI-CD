'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import ThemeProvider from '@/components/ThemeProvider';
import Layout from '@/components/Layout';
import DataTable, { Column } from '@/components/DataTable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
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
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user, page, limit, search, departmentFilter]);

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
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(departmentFilter && { department: departmentFilter }),
      });
      const response = await fetch(`/api/subjects?${params}`);
      const data = await response.json();
      setSubjects(data.subjects || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        scheme: subject.scheme,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        teachingDepartment: subject.teachingDepartment,
        credits: subject.credits.toString(),
        maxCIE: subject.maxCIE.toString(),
        maxSEE: subject.maxSEE.toString(),
        totalMarks: subject.totalMarks.toString(),
      });
    } else {
      setEditingSubject(null);
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
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubject(null);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const url = editingSubject ? `/api/subjects/${editingSubject.id}` : '/api/subjects';
      const method = editingSubject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred');
        return;
      }

      handleCloseDialog();
      fetchSubjects();
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const response = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchSubjects();
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(subjects);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subjects');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'subjects.xlsx');
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Upload each row
        for (const row of jsonData as any[]) {
          await fetch('/api/subjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scheme: row.scheme || '',
              subjectCode: row.subjectCode || row['Subject Code'] || '',
              subjectName: row.subjectName || row['Subject Name'] || '',
              teachingDepartment: row.teachingDepartment || row['Department'] || '',
              credits: row.credits?.toString() || '',
              maxCIE: row.maxCIE?.toString() || row['Max CIE']?.toString() || '',
              maxSEE: row.maxSEE?.toString() || row['Max SEE']?.toString() || '',
              totalMarks: row.totalMarks?.toString() || row['Total Marks']?.toString() || '',
            }),
          });
        }

        fetchSubjects();
        alert('Bulk upload completed');
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const columns: Column[] = [
    { id: 'subjectCode', label: 'Subject Code', minWidth: 120 },
    { id: 'subjectName', label: 'Subject Name', minWidth: 200 },
    { id: 'scheme', label: 'Scheme', minWidth: 100 },
    { id: 'teachingDepartment', label: 'Department', minWidth: 150 },
    {
      id: 'credits',
      label: 'Credits',
      minWidth: 80,
      align: 'right',
    },
    {
      id: 'maxCIE',
      label: 'Max CIE',
      minWidth: 100,
      align: 'right',
    },
    {
      id: 'maxSEE',
      label: 'Max SEE',
      minWidth: 100,
      align: 'right',
    },
    {
      id: 'totalMarks',
      label: 'Total Marks',
      minWidth: 120,
      align: 'right',
    },
  ];

  const mobileCard = (row: Subject) => (
    <Box>
      <Typography variant="h6">{row.subjectName}</Typography>
      <Typography variant="body2" color="text.secondary">
        {row.subjectCode}
      </Typography>
      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label={row.teachingDepartment} size="small" />
        <Chip label={`${row.credits} Credits`} size="small" />
        <Chip label={`CIE: ${row.maxCIE}`} size="small" />
        <Chip label={`SEE: ${row.maxSEE}`} size="small" />
      </Box>
    </Box>
  );

  if (loading && !user) {
    return (
      <ThemeProvider>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <ThemeProvider>
      <Layout user={user}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Subjects Management</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              component="label"
            >
              Bulk Upload
              <input type="file" hidden accept=".xlsx,.xls" onChange={handleBulkUpload} />
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
              Export
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
              Add Subject
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Filter by Department</InputLabel>
            <Select
              value={departmentFilter}
              label="Filter by Department"
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Departments</MenuItem>
              <MenuItem value="CS">Computer Science</MenuItem>
              <MenuItem value="ME">Mechanical Engineering</MenuItem>
              <MenuItem value="CE">Civil Engineering</MenuItem>
              <MenuItem value="EE">Electrical Engineering</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <DataTable
          columns={columns}
          data={subjects}
          total={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(0);
          }}
          searchable
          onSearch={(searchTerm) => {
            setSearch(searchTerm);
            setPage(0);
          }}
          mobileCard={mobileCard}
          actions={(row) => (
            <Box>
              <IconButton size="small" onClick={() => handleOpenDialog(row)}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" onClick={() => handleDelete(row.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        />

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Scheme"
                value={formData.scheme}
                onChange={(e) => setFormData({ ...formData, scheme: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Subject Code"
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                fullWidth
                required
                disabled={!!editingSubject}
              />
              <TextField
                label="Subject Name"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Teaching Department"
                value={formData.teachingDepartment}
                onChange={(e) => setFormData({ ...formData, teachingDepartment: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Credits"
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Max CIE"
                type="number"
                value={formData.maxCIE}
                onChange={(e) => setFormData({ ...formData, maxCIE: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Max SEE"
                type="number"
                value={formData.maxSEE}
                onChange={(e) => setFormData({ ...formData, maxSEE: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Total Marks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                fullWidth
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingSubject ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </ThemeProvider>
  );
}
