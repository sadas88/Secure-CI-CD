import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/middleware';
import { getDataSource } from '@/lib/database';
import { Attendance } from '@/lib/entities/Attendance';
import { UserRole } from '@/lib/entities/User';
import { logAudit, AuditAction } from '@/lib/audit';
import { validateAttendancePercentage } from '@/lib/validation';

async function getHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const subjectId = searchParams.get('subjectId') || '';
    const studentId = searchParams.get('studentId') || '';
    const month = searchParams.get('month') || '';
    const year = searchParams.get('year') || '';

    const dataSource = await getDataSource();
    const attendanceRepository = dataSource.getRepository(Attendance);

    const queryBuilder = attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.subject', 'subject')
      .leftJoinAndSelect('attendance.faculty', 'faculty');

    if (subjectId) {
      queryBuilder.andWhere('attendance.subjectId = :subjectId', { subjectId: parseInt(subjectId) });
    }

    if (studentId) {
      queryBuilder.andWhere('attendance.studentId = :studentId', { studentId: parseInt(studentId) });
    }

    if (month) {
      queryBuilder.andWhere('attendance.month = :month', { month: parseInt(month) });
    }

    if (year) {
      queryBuilder.andWhere('attendance.year = :year', { year: parseInt(year) });
    }

    // Faculty can only see their own attendance records
    if (req.user!.role === UserRole.FACULTY) {
      const { Faculty } = await import('@/lib/entities/Faculty');
      const facultyRepository = dataSource.getRepository(Faculty);
      const faculty = await facultyRepository.findOne({ where: { email: req.user!.email } });
      if (faculty) {
        queryBuilder.andWhere('attendance.facultyId = :facultyId', { facultyId: faculty.id });
      }
    }

    queryBuilder.orderBy('attendance.year', 'DESC').addOrderBy('attendance.month', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [attendance, total] = await queryBuilder.getManyAndCount();

    return NextResponse.json({
      attendance,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function postHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { studentId, subjectId, month, year, totalClasses, attendedClasses } = data;

    if (!studentId || !subjectId || !month || !year || totalClasses === undefined || attendedClasses === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const attendanceRepository = dataSource.getRepository(Attendance);

    // Get faculty ID from user
    const { Faculty } = await import('@/lib/entities/Faculty');
    const facultyRepository = dataSource.getRepository(Faculty);
    const faculty = await facultyRepository.findOne({ where: { email: req.user!.email } });
    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Check if attendance already exists
    const existing = await attendanceRepository.findOne({
      where: { studentId: parseInt(studentId), subjectId: parseInt(subjectId), month: parseInt(month), year: parseInt(year), facultyId: faculty.id },
    });

    const percentage = validateAttendancePercentage(attendedClasses, totalClasses);

    if (existing) {
      existing.totalClasses = parseInt(totalClasses);
      existing.attendedClasses = parseInt(attendedClasses);
      existing.percentage = percentage;
      const updated = await attendanceRepository.save(existing);

      await logAudit(
        req.user!.userId,
        req.user!.email,
        req.user!.role,
        AuditAction.UPDATE,
        'Attendance',
        updated.id,
        `Updated attendance for student ${studentId}`,
        req
      );

      return NextResponse.json({ attendance: updated });
    } else {
      const attendance = attendanceRepository.create({
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        facultyId: faculty.id,
        month: parseInt(month),
        year: parseInt(year),
        totalClasses: parseInt(totalClasses),
        attendedClasses: parseInt(attendedClasses),
        percentage,
      });

      const saved = await attendanceRepository.save(attendance);

      await logAudit(
        req.user!.userId,
        req.user!.email,
        req.user!.role,
        AuditAction.CREATE,
        'Attendance',
        saved.id,
        `Created attendance for student ${studentId}`,
        req
      );

      return NextResponse.json({ attendance: saved }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withRole([UserRole.FACULTY])(postHandler);
