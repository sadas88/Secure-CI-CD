'use client';

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface ClearDataDialogProps {
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
}

export function ClearDataDialog({
  onConfirm,
  title,
  description,
  confirmText = 'DELETE',
}: ClearDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (confirmInput !== confirmText) {
      setError(`Please type "${confirmText}" to confirm`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm();
      setOpen(false);
      setConfirmInput('');
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={() => setOpen(true)}
      >
        Clear All Data
      </Button>
      <Dialog open={open} onClose={() => !loading && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {description}
          </Alert>
          <TextField
            fullWidth
            label={`Type "${confirmText}" to confirm`}
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            disabled={loading}
            sx={{ mt: 2 }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="error"
            disabled={loading || confirmInput !== confirmText}
          >
            {loading ? 'Processing...' : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
