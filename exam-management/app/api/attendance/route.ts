import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Attendance } from '@/lib/entities/Attendance';
import { requireRole } from '@/lib/middleware/auth';
import { UserRole } from '@/lib/entities/User';
import { authenticateRequest } from '@/lib/middleware/auth';
import { createAuditLog } from '@/lib/auth';
import { AuditAction } from '@/lib/entities/AuditLog';
import { calculateAttendancePercentage } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Attendance);
    
    const where: any = {};
    if (studentId) where.studentId = parseInt(studentId);
    if (subjectId) where.subjectId = parseInt(subjectId);
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const attendances = await repository.find({
      where,
      relations: ['student', 'subject'],
      order: { year: 'DESC', month: 'DESC' },
    });

    return NextResponse.json(attendances);
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole([UserRole.FACULTY])(request);
    if (authCheck) return authCheck;

    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, subjectId, month, year, totalClasses, attendedClasses } = body;

    if (!studentId || !subjectId || !month || !year || totalClasses === undefined || attendedClasses === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (attendedClasses > totalClasses) {
      return NextResponse.json({ error: 'Attended classes cannot exceed total classes' }, { status: 400 });
    }

    const percentage = calculateAttendancePercentage(totalClasses, attendedClasses);

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Attendance);

    const attendance = repository.create({
      studentId: parseInt(studentId),
      subjectId: parseInt(subjectId),
      month: parseInt(month),
      year: parseInt(year),
      totalClasses: parseInt(totalClasses),
      attendedClasses: parseInt(attendedClasses),
      percentage,
      createdBy: auth.user.id,
    });

    const saved = await repository.save(attendance);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.CREATE,
      'Attendance',
      saved.id,
      { studentId, subjectId, month, year, percentage }
    );

    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error creating attendance:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Attendance for this month already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = await requireRole([UserRole.FACULTY])(request);
    if (authCheck) return authCheck;

    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, totalClasses, attendedClasses } = body;

    if (!id || totalClasses === undefined || attendedClasses === undefined) {
      return NextResponse.json({ error: 'ID, total classes, and attended classes are required' }, { status: 400 });
    }

    if (attendedClasses > totalClasses) {
      return NextResponse.json({ error: 'Attended classes cannot exceed total classes' }, { status: 400 });
    }

    const percentage = calculateAttendancePercentage(totalClasses, attendedClasses);

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Attendance);
    const attendance = await repository.findOne({ where: { id: parseInt(id) } });

    if (!attendance) {
      return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
    }

    attendance.totalClasses = parseInt(totalClasses);
    attendance.attendedClasses = parseInt(attendedClasses);
    attendance.percentage = percentage;

    const updated = await repository.save(attendance);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.UPDATE,
      'Attendance',
      updated.id,
      { totalClasses, attendedClasses, percentage }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
