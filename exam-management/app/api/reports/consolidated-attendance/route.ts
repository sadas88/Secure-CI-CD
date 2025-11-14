import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Attendance } from '@/lib/entities/Attendance';
import { Student } from '@/lib/entities/Student';
import { Class } from '@/lib/entities/Class';
import { authenticateRequest } from '@/lib/middleware/auth';
import { requireRole } from '@/lib/middleware/auth';
import { UserRole } from '@/lib/entities/User';

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole([UserRole.HOD])(request);
    if (authCheck) return authCheck;

    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const semesterId = searchParams.get('semesterId');

    if (!classId && !semesterId) {
      return NextResponse.json({ error: 'Class ID or Semester ID is required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const studentRepository = dataSource.getRepository(Student);
    const attendanceRepository = dataSource.getRepository(Attendance);

    let students: Student[];
    if (classId) {
      students = await studentRepository.find({
        where: { classId: parseInt(classId) },
        relations: ['class', 'class.branch', 'class.semester'],
      });
    } else {
      const classRepository = dataSource.getRepository(Class);
      const classes = await classRepository.find({
        where: { semesterId: parseInt(semesterId!) },
        relations: ['branch', 'semester'],
      });
      const classIds = classes.map((c) => c.id);
      students = await studentRepository.find({
        where: classIds.map((id) => ({ classId: id })),
        relations: ['class', 'class.branch', 'class.semester'],
      });
    }

    const consolidatedData = await Promise.all(
      students.map(async (student) => {
        const attendances = await attendanceRepository.find({
          where: { studentId: student.id },
          relations: ['subject'],
        });

        const subjectAttendance = attendances.map((att) => ({
          subjectId: att.subjectId,
          subjectCode: att.subject.subjectCode,
          subjectName: att.subject.subjectName,
          percentage: att.percentage || 0,
          month: att.month,
          year: att.year,
        }));

        return {
          studentId: student.id,
          usn: student.usn,
          name: student.name,
          class: `${student.class.branch.branchCode}-${student.class.semester.semesterNumber}-${student.class.section}`,
          subjects: subjectAttendance,
        };
      })
    );

    return NextResponse.json(consolidatedData);
  } catch (error: any) {
    console.error('Error generating consolidated attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
