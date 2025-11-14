import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { getDataSource } from '@/lib/database';
import { User } from '@/lib/entities/User';

async function handler(req: AuthenticatedRequest) {
  const dataSource = await getDataSource();
  const userRepository = dataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { id: req.user!.userId },
    select: ['id', 'email', 'name', 'role', 'departmentId'],
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export const GET = withAuth(handler);
