import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Faculty } from '@/lib/entities/Faculty';
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
    const repository = dataSource.getRepository(Faculty);
    const faculty = await repository.find({ order: { name: 'ASC' } });

    return NextResponse.json(faculty);
  } catch (error: any) {
    console.error('Error fetching faculty:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole([UserRole.ADMIN])(request);
    if (authCheck) return authCheck;

    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { employeeId, name, email, phone, department } = body;

    if (!employeeId || !name || !email || !department) {
      return NextResponse.json({ error: 'Employee ID, name, email, and department are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Faculty);

    const faculty = repository.create({
      employeeId,
      name,
      email,
      phone: phone || null,
      department,
    });

    const saved = await repository.save(faculty);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.CREATE,
      'Faculty',
      saved.id,
      { employeeId, name }
    );

    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error creating faculty:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Employee ID or email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
