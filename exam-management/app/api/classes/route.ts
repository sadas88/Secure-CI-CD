import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Class } from '@/lib/entities/Class';
import { requireRole } from '@/lib/middleware/auth';
import { UserRole } from '@/lib/entities/User';
import { authenticateRequest } from '@/lib/middleware/auth';
import { createAuditLog } from '@/lib/auth';
import { AuditAction } from '@/lib/entities/AuditLog';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Class);
    const classes = await repository.find({
      relations: ['branch', 'semester'],
      order: { createdAt: 'DESC' },
    });

    return NextResponse.json(classes);
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole([UserRole.ADMIN, UserRole.HOD])(request);
    if (authCheck) return authCheck;

    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { branchId, semesterId, section } = body;

    if (!branchId || !semesterId || !section) {
      return NextResponse.json({ error: 'Branch, semester, and section are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Class);

    const classEntity = repository.create({
      branchId: parseInt(branchId),
      semesterId: parseInt(semesterId),
      section: section.toUpperCase(),
    });

    const saved = await repository.save(classEntity);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.CREATE,
      'Class',
      saved.id,
      { branchId, semesterId, section }
    );

    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error creating class:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Class already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
