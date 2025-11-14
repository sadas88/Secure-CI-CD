import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Student } from '@/lib/entities/Student';
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

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Student);
    
    const where: any = {};
    if (classId) {
      where.classId = parseInt(classId);
    }

    const students = await repository.find({
      where,
      relations: ['class', 'class.branch', 'class.semester'],
      order: { usn: 'ASC' },
    });

    return NextResponse.json(students);
  } catch (error: any) {
    console.error('Error fetching students:', error);
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
    const { usn, name, email, phone, classId } = body;

    if (!usn || !name || !classId) {
      return NextResponse.json({ error: 'USN, name, and class are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Student);

    const student = repository.create({
      usn: usn.toUpperCase(),
      name,
      email: email || null,
      phone: phone || null,
      classId: parseInt(classId),
    });

    const saved = await repository.save(student);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.CREATE,
      'Student',
      saved.id,
      { usn, name }
    );

    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error creating student:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'USN already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
