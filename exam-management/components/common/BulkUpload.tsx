'use client';

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface BulkUploadProps {
  onUpload: (file: File) => Promise<void>;
  acceptedFileTypes?: string;
  sampleFileName?: string;
}

export function BulkUpload({ onUpload, acceptedFileTypes = '.xlsx,.xls', sampleFileName }: BulkUploadProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onUpload(file);
      setOpen(false);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        onClick={() => setOpen(true)}
      >
        Bulk Upload
      </Button>
      <Dialog open={open} onClose={() => !loading && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Upload</DialogTitle>
        <DialogContent>
          {sampleFileName && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Download sample file: <a href={`/samples/${sampleFileName}`} download>{sampleFileName}</a>
            </Alert>
          )}
          <Box>
            <input
              accept={acceptedFileTypes}
              style={{ display: 'none' }}
              id="bulk-upload-file"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="bulk-upload-file">
              <Button variant="outlined" component="span" fullWidth>
                {file ? file.name : 'Select File'}
              </Button>
            </label>
            {file && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </Typography>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} variant="contained" disabled={loading || !file}>
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
