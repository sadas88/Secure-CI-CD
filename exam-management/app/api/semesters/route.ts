import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Semester } from '@/lib/entities/Semester';
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
    const repository = dataSource.getRepository(Semester);
    const semesters = await repository.find({ order: { semesterNumber: 'ASC' } });

    return NextResponse.json(semesters);
  } catch (error: any) {
    console.error('Error fetching semesters:', error);
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
    const { semesterNumber, academicYear } = body;

    if (!semesterNumber || !academicYear) {
      return NextResponse.json({ error: 'Semester number and academic year are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Semester);

    const semester = repository.create({
      semesterNumber: parseInt(semesterNumber),
      academicYear,
    });

    const saved = await repository.save(semester);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.CREATE,
      'Semester',
      saved.id,
      { semesterNumber, academicYear }
    );

    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error creating semester:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Semester number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
