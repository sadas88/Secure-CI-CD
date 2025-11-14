import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '../auth';
import { UserRole } from '../entities/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: { id: number; email: string; role: UserRole } } | null> {
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

export function requireRole(allowedRoles: UserRole[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!allowedRoles.includes(auth.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return null;
  };
}

export function requireAuth() {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return null;
  };
}
