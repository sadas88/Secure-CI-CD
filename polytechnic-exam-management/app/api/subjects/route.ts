import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/middleware';
import { getDataSource } from '@/lib/database';
import { Subject } from '@/lib/entities/Subject';
import { UserRole } from '@/lib/entities/User';
import { logAudit, AuditAction } from '@/lib/audit';

// GET - List subjects with pagination, search, and filtering
async function getHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const sortBy = searchParams.get('sortBy') || 'subjectCode';
    const sortOrder = searchParams.get('sortOrder') || 'ASC';

    const dataSource = await getDataSource();
    const subjectRepository = dataSource.getRepository(Subject);

    const queryBuilder = subjectRepository.createQueryBuilder('subject');

    if (search) {
      queryBuilder.where(
        '(subject.subjectCode LIKE :search OR subject.subjectName LIKE :search OR subject.scheme LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (department) {
      queryBuilder.andWhere('subject.teachingDepartment = :department', { department });
    }

    queryBuilder.orderBy(`subject.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [subjects, total] = await queryBuilder.getManyAndCount();

    return NextResponse.json({
      subjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create subject (Admin only)
async function postHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { scheme, subjectCode, subjectName, teachingDepartment, credits, maxCIE, maxSEE, totalMarks } = data;

    // Validation
    if (!scheme || !subjectCode || !subjectName || !teachingDepartment || !credits || !maxCIE || !maxSEE || !totalMarks) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (maxCIE + maxSEE > totalMarks) {
      return NextResponse.json({ error: 'CIE + SEE cannot exceed Total Marks' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const subjectRepository = dataSource.getRepository(Subject);

    // Check if subject code already exists
    const existing = await subjectRepository.findOne({ where: { subjectCode } });
    if (existing) {
      return NextResponse.json({ error: 'Subject code already exists' }, { status: 400 });
    }

    const subject = subjectRepository.create({
      scheme,
      subjectCode,
      subjectName,
      teachingDepartment,
      credits: parseFloat(credits),
      maxCIE: parseInt(maxCIE),
      maxSEE: parseInt(maxSEE),
      totalMarks: parseInt(totalMarks),
    });

    const savedSubject = await subjectRepository.save(subject);

    await logAudit(
      req.user!.userId,
      req.user!.email,
      req.user!.role,
      AuditAction.CREATE,
      'Subject',
      savedSubject.id,
      `Created subject: ${subjectCode}`,
      req
    );

    return NextResponse.json({ subject: savedSubject }, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withRole([UserRole.ADMIN])(postHandler);
