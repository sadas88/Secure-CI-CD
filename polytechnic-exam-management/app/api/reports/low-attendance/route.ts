import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/middleware';
import { getDataSource } from '@/lib/database';
import { Attendance } from '@/lib/entities/Attendance';
import { UserRole } from '@/lib/entities/User';
import { ATTENDANCE_THRESHOLD } from '@/lib/validation';

async function handler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId') || '';
    const semesterId = searchParams.get('semesterId') || '';
    const subjectId = searchParams.get('subjectId') || '';

    if (!classId && !semesterId) {
      return NextResponse.json({ error: 'Class ID or Semester ID is required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const attendanceRepository = dataSource.getRepository(Attendance);

    const queryBuilder = attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.subject', 'subject')
      .leftJoinAndSelect('student.class', 'class')
      .leftJoinAndSelect('class.semester', 'semester')
      .leftJoinAndSelect('class.branch', 'branch');

    if (classId) {
      queryBuilder.andWhere('student.classId = :classId', { classId: parseInt(classId) });
    }

    if (semesterId) {
      queryBuilder.andWhere('class.semesterId = :semesterId', { semesterId: parseInt(semesterId) });
    }

    if (subjectId) {
      queryBuilder.andWhere('attendance.subjectId = :subjectId', { subjectId: parseInt(subjectId) });
    }

    // Get latest attendance for each student-subject combination
    const allAttendance = await queryBuilder.getMany();

    // Group by student and subject, get latest
    const latestAttendance = new Map<string, Attendance>();
    for (const att of allAttendance) {
      const key = `${att.studentId}-${att.subjectId}`;
      const existing = latestAttendance.get(key);
      if (!existing || (att.year > existing.year) || (att.year === existing.year && att.month > existing.month)) {
        latestAttendance.set(key, att);
      }
    }

    // Filter low attendance
    const lowAttendance = Array.from(latestAttendance.values()).filter(
      (att) => att.percentage !== null && att.percentage < ATTENDANCE_THRESHOLD
    );

    return NextResponse.json({
      lowAttendance,
      threshold: ATTENDANCE_THRESHOLD,
      total: lowAttendance.length,
    });
  } catch (error) {
    console.error('Error generating low attendance report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withRole([UserRole.ADMIN, UserRole.HOD])(handler);
