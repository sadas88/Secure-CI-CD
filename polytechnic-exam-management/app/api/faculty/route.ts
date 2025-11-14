import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/middleware';
import { getDataSource } from '@/lib/database';
import { Faculty } from '@/lib/entities/Faculty';
import { UserRole } from '@/lib/entities/User';
import { logAudit, AuditAction } from '@/lib/audit';

async function getHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';

    const dataSource = await getDataSource();
    const facultyRepository = dataSource.getRepository(Faculty);

    const queryBuilder = facultyRepository.createQueryBuilder('faculty');

    if (search) {
      queryBuilder.where(
        '(faculty.facultyId LIKE :search OR faculty.name LIKE :search OR faculty.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (department) {
      queryBuilder.andWhere('faculty.department = :department', { department });
    }

    queryBuilder.orderBy('faculty.name', 'ASC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [faculty, total] = await queryBuilder.getManyAndCount();

    return NextResponse.json({
      faculty,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function postHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { facultyId, name, email, department, designation, phoneNumber } = data;

    if (!facultyId || !name || !email || !department) {
      return NextResponse.json({ error: 'Faculty ID, name, email, and department are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const facultyRepository = dataSource.getRepository(Faculty);

    const existing = await facultyRepository.findOne({ where: { facultyId } });
    if (existing) {
      return NextResponse.json({ error: 'Faculty ID already exists' }, { status: 400 });
    }

    const faculty = facultyRepository.create({
      facultyId,
      name,
      email: email.toLowerCase(),
      department,
      designation,
      phoneNumber,
    });

    const savedFaculty = await facultyRepository.save(faculty);

    await logAudit(
      req.user!.userId,
      req.user!.email,
      req.user!.role,
      AuditAction.CREATE,
      'Faculty',
      savedFaculty.id,
      `Created faculty: ${facultyId}`,
      req
    );

    return NextResponse.json({ faculty: savedFaculty }, { status: 201 });
  } catch (error) {
    console.error('Error creating faculty:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withRole([UserRole.ADMIN])(postHandler);
