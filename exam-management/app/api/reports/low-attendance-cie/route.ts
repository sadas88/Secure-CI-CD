import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Attendance } from '@/lib/entities/Attendance';
import { CIEMark } from '@/lib/entities/CIEMark';
import { Student } from '@/lib/entities/Student';
import { Class } from '@/lib/entities/Class';
import { authenticateRequest } from '@/lib/middleware/auth';
import { requireRole } from '@/lib/middleware/auth';
import { UserRole } from '@/lib/entities/User';
import { isLowAttendance, ATTENDANCE_THRESHOLD } from '@/lib/utils/validation';

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
    const cieMarkRepository = dataSource.getRepository(CIEMark);

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

    const lowAttendanceStudents: any[] = [];
    const lowCIEStudents: any[] = [];

    for (const student of students) {
      const attendances = await attendanceRepository.find({
        where: { studentId: student.id },
        relations: ['subject'],
      });

      const lowAttendanceSubjects = attendances
        .filter((att) => att.percentage !== null && isLowAttendance(att.percentage))
        .map((att) => ({
          subjectId: att.subjectId,
          subjectCode: att.subject.subjectCode,
          subjectName: att.subject.subjectName,
          percentage: att.percentage,
          threshold: ATTENDANCE_THRESHOLD,
        }));

      if (lowAttendanceSubjects.length > 0) {
        lowAttendanceStudents.push({
          studentId: student.id,
          usn: student.usn,
          name: student.name,
          class: `${student.class.branch.branchCode}-${student.class.semester.semesterNumber}-${student.class.section}`,
          subjects: lowAttendanceSubjects,
        });
      }

      const cieMarks = await cieMarkRepository.find({
        where: { studentId: student.id },
        relations: ['subject'],
      });

      const lowCIESubjects = cieMarks
        .filter((mark) => {
          const subject = mark.subject;
          const ciePercentage = (mark.cieMarks / subject.maxCIE) * 100;
          return ciePercentage < 50; // Consider low if less than 50% of max CIE
        })
        .map((mark) => ({
          subjectId: mark.subjectId,
          subjectCode: mark.subject.subjectCode,
          subjectName: mark.subject.subjectName,
          cieMarks: mark.cieMarks,
          maxCIE: mark.subject.maxCIE,
          percentage: (mark.cieMarks / mark.subject.maxCIE) * 100,
        }));

      if (lowCIESubjects.length > 0) {
        lowCIEStudents.push({
          studentId: student.id,
          usn: student.usn,
          name: student.name,
          class: `${student.class.branch.branchCode}-${student.class.semester.semesterNumber}-${student.class.section}`,
          subjects: lowCIESubjects,
        });
      }
    }

    return NextResponse.json({
      lowAttendance: lowAttendanceStudents,
      lowCIE: lowCIEStudents,
    });
  } catch (error: any) {
    console.error('Error generating low attendance/CIE report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
