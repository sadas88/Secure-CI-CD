'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Box,
  IconButton,
  Chip,
  TableFooter,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  title?: string;
  searchable?: boolean;
  searchFields?: (keyof T)[];
  exportable?: boolean;
  onExport?: () => void;
  mobileCard?: (row: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  title,
  searchable = true,
  searchFields,
  exportable = false,
  onExport,
  mobileCard,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredRows = useMemo(() => {
    let filtered = [...rows];

    // Search
    if (searchTerm && searchable) {
      const fields = searchFields || columns.map((col) => col.id as keyof T);
      filtered = filtered.filter((row) =>
        fields.some((field) => {
          const value = row[field];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Sort
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField as keyof T];
        const bVal = b[sortField as keyof T];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [rows, searchTerm, sortField, sortDirection, searchable, searchFields, columns]);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleSort = (field: keyof T | string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (isMobile && mobileCard) {
    return (
      <Card>
        <CardContent>
          {title && (
            <Box mb={2}>
              <h2>{title}</h2>
            </Box>
          )}
          {searchable && (
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          )}
          <Box>
            {paginatedRows.map((row, idx) => (
              <Box key={idx} mb={2}>
                {mobileCard(row)}
              </Box>
            ))}
          </Box>
          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {title && (
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <h2>{title}</h2>
            {exportable && onExport && (
              <Chip label="Export" onClick={onExport} clickable color="primary" />
            )}
          </Box>
        )}
        {searchable && (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        )}
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={String(column.id)}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      {column.label}
                      {column.sortable !== false && (
                        <IconButton
                          size="small"
                          onClick={() => handleSort(column.id)}
                        >
                          {sortField === column.id ? (
                            sortDirection === 'asc' ? (
                              <ArrowUpwardIcon fontSize="small" />
                            ) : (
                              <ArrowDownwardIcon fontSize="small" />
                            )
                          ) : (
                            <Box sx={{ opacity: 0.3 }}>
                              <ArrowUpwardIcon fontSize="small" />
                            </Box>
                          )}
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row, idx) => (
                <TableRow hover key={idx}>
                  {columns.map((column) => {
                    const value = row[column.id as keyof T];
                    return (
                      <TableCell key={String(column.id)} align={column.align}>
                        {column.format ? column.format(value, row) : String(value ?? '')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </CardContent>
    </Card>
  );
}
