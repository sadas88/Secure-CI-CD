import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { logAudit, AuditAction } from '@/lib/audit';

async function handler(req: AuthenticatedRequest) {
  if (req.user) {
    await logAudit(req.user.userId, req.user.email, req.user.role, AuditAction.LOGOUT, 'User', req.user.userId, 'User logged out', req);
  }

  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.cookies.delete('token');
  return response;
}

export const POST = withAuth(handler);
