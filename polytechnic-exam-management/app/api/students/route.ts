import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/middleware';
import { getDataSource } from '@/lib/database';
import { Student } from '@/lib/entities/Student';
import { UserRole } from '@/lib/entities/User';
import { logAudit, AuditAction } from '@/lib/audit';

async function getHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const classId = searchParams.get('classId') || '';

    const dataSource = await getDataSource();
    const studentRepository = dataSource.getRepository(Student);

    const queryBuilder = studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.class', 'class')
      .leftJoinAndSelect('class.branch', 'branch')
      .leftJoinAndSelect('class.semester', 'semester');

    if (search) {
      queryBuilder.where(
        '(student.usn LIKE :search OR student.name LIKE :search OR student.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (classId) {
      queryBuilder.andWhere('student.classId = :classId', { classId: parseInt(classId) });
    }

    queryBuilder.orderBy('student.usn', 'ASC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [students, total] = await queryBuilder.getManyAndCount();

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function postHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { usn, name, email, phoneNumber, classId } = data;

    if (!usn || !name || !classId) {
      return NextResponse.json({ error: 'USN, name, and class are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const studentRepository = dataSource.getRepository(Student);

    const existing = await studentRepository.findOne({ where: { usn } });
    if (existing) {
      return NextResponse.json({ error: 'USN already exists' }, { status: 400 });
    }

    const student = studentRepository.create({
      usn,
      name,
      email: email?.toLowerCase(),
      phoneNumber,
      classId: parseInt(classId),
    });

    const savedStudent = await studentRepository.save(student);

    await logAudit(
      req.user!.userId,
      req.user!.email,
      req.user!.role,
      AuditAction.CREATE,
      'Student',
      savedStudent.id,
      `Created student: ${usn}`,
      req
    );

    return NextResponse.json({ student: savedStudent }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withRole([UserRole.ADMIN, UserRole.HOD])(postHandler);
