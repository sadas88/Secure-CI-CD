import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/middleware';
import { getDataSource } from '@/lib/database';
import { Class } from '@/lib/entities/Class';
import { Branch } from '@/lib/entities/Branch';
import { Semester } from '@/lib/entities/Semester';
import { UserRole } from '@/lib/entities/User';
import { logAudit, AuditAction } from '@/lib/audit';

async function getHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId') || '';
    const semesterId = searchParams.get('semesterId') || '';

    const dataSource = await getDataSource();
    const classRepository = dataSource.getRepository(Class);

    const queryBuilder = classRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.branch', 'branch')
      .leftJoinAndSelect('class.semester', 'semester');

    if (branchId) {
      queryBuilder.andWhere('class.branchId = :branchId', { branchId: parseInt(branchId) });
    }

    if (semesterId) {
      queryBuilder.andWhere('class.semesterId = :semesterId', { semesterId: parseInt(semesterId) });
    }

    const classes = await queryBuilder.getMany();

    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function postHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { branchId, semesterId, section } = data;

    if (!branchId || !semesterId || !section) {
      return NextResponse.json({ error: 'Branch, semester, and section are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const classRepository = dataSource.getRepository(Class);
    const branchRepository = dataSource.getRepository(Branch);
    const semesterRepository = dataSource.getRepository(Semester);

    const branch = await branchRepository.findOne({ where: { id: parseInt(branchId) } });
    const semester = await semesterRepository.findOne({ where: { id: parseInt(semesterId) } });

    if (!branch || !semester) {
      return NextResponse.json({ error: 'Branch or semester not found' }, { status: 404 });
    }

    const className = `${branch.branchCode}${semester.semesterNumber}${section.toUpperCase()}`;

    const existing = await classRepository.findOne({ where: { className } });
    if (existing) {
      return NextResponse.json({ error: 'Class already exists' }, { status: 400 });
    }

    const classEntity = classRepository.create({
      branchId: parseInt(branchId),
      semesterId: parseInt(semesterId),
      section: section.toUpperCase(),
      className,
    });

    const savedClass = await classRepository.save(classEntity);

    await logAudit(
      req.user!.userId,
      req.user!.email,
      req.user!.role,
      AuditAction.CREATE,
      'Class',
      savedClass.id,
      `Created class: ${className}`,
      req
    );

    return NextResponse.json({ class: savedClass }, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withRole([UserRole.ADMIN, UserRole.HOD])(postHandler);
