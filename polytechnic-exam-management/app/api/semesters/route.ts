import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/middleware';
import { getDataSource } from '@/lib/database';
import { Semester } from '@/lib/entities/Semester';
import { UserRole } from '@/lib/entities/User';
import { logAudit, AuditAction } from '@/lib/audit';

async function getHandler(req: AuthenticatedRequest) {
  try {
    const dataSource = await getDataSource();
    const semesterRepository = dataSource.getRepository(Semester);

    const semesters = await semesterRepository.find({
      order: { semesterNumber: 'ASC', academicYear: 'DESC' },
    });

    return NextResponse.json({ semesters });
  } catch (error) {
    console.error('Error fetching semesters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function postHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { semesterNumber, academicYear, startDate, endDate } = data;

    if (!semesterNumber || !academicYear) {
      return NextResponse.json({ error: 'Semester number and academic year are required' }, { status: 400 });
    }

    if (semesterNumber < 1 || semesterNumber > 6) {
      return NextResponse.json({ error: 'Semester number must be between 1 and 6' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const semesterRepository = dataSource.getRepository(Semester);

    const semester = semesterRepository.create({
      semesterNumber: parseInt(semesterNumber),
      academicYear,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    const savedSemester = await semesterRepository.save(semester);

    await logAudit(
      req.user!.userId,
      req.user!.email,
      req.user!.role,
      AuditAction.CREATE,
      'Semester',
      savedSemester.id,
      `Created semester: ${semesterNumber} - ${academicYear}`,
      req
    );

    return NextResponse.json({ semester: savedSemester }, { status: 201 });
  } catch (error) {
    console.error('Error creating semester:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withRole([UserRole.ADMIN])(postHandler);
