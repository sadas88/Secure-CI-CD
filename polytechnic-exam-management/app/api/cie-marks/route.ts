import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/middleware';
import { getDataSource } from '@/lib/database';
import { CIEMarks } from '@/lib/entities/CIEMarks';
import { Subject } from '@/lib/entities/Subject';
import { Faculty } from '@/lib/entities/Faculty';
import { UserRole } from '@/lib/entities/User';
import { logAudit, AuditAction } from '@/lib/audit';
import { validateCIEMarks } from '@/lib/validation';

async function getHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const subjectId = searchParams.get('subjectId') || '';
    const studentId = searchParams.get('studentId') || '';

    const dataSource = await getDataSource();
    const cieMarksRepository = dataSource.getRepository(CIEMarks);

    const queryBuilder = cieMarksRepository
      .createQueryBuilder('cieMarks')
      .leftJoinAndSelect('cieMarks.student', 'student')
      .leftJoinAndSelect('cieMarks.subject', 'subject')
      .leftJoinAndSelect('cieMarks.faculty', 'faculty');

    if (subjectId) {
      queryBuilder.andWhere('cieMarks.subjectId = :subjectId', { subjectId: parseInt(subjectId) });
    }

    if (studentId) {
      queryBuilder.andWhere('cieMarks.studentId = :studentId', { studentId: parseInt(studentId) });
    }

    // Faculty can only see their own CIE marks
    if (req.user!.role === UserRole.FACULTY) {
      const facultyRepository = dataSource.getRepository(Faculty);
      const faculty = await facultyRepository.findOne({ where: { email: req.user!.email } });
      if (faculty) {
        queryBuilder.andWhere('cieMarks.facultyId = :facultyId', { facultyId: faculty.id });
      }
    }

    queryBuilder.orderBy('cieMarks.createdAt', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [cieMarks, total] = await queryBuilder.getManyAndCount();

    return NextResponse.json({
      cieMarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching CIE marks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function postHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { studentId, subjectId, marksObtained } = data;

    if (!studentId || !subjectId || marksObtained === undefined) {
      return NextResponse.json({ error: 'Student, subject, and marks are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const cieMarksRepository = dataSource.getRepository(CIEMarks);
    const subjectRepository = dataSource.getRepository(Subject);
    const facultyRepository = dataSource.getRepository(Faculty);

    const subject = await subjectRepository.findOne({ where: { id: parseInt(subjectId) } });
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    const faculty = await facultyRepository.findOne({ where: { email: req.user!.email } });
    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    if (parseInt(marksObtained) > subject.maxCIE) {
      return NextResponse.json({ error: `Marks cannot exceed maximum CIE marks (${subject.maxCIE})` }, { status: 400 });
    }

    // Check if CIE marks already exist
    const existing = await cieMarksRepository.findOne({
      where: { studentId: parseInt(studentId), subjectId: parseInt(subjectId), facultyId: faculty.id },
    });

    if (existing) {
      existing.marksObtained = parseInt(marksObtained);
      existing.maxMarks = subject.maxCIE;
      const updated = await cieMarksRepository.save(existing);

      await logAudit(
        req.user!.userId,
        req.user!.email,
        req.user!.role,
        AuditAction.UPDATE,
        'CIEMarks',
        updated.id,
        `Updated CIE marks for student ${studentId}`,
        req
      );

      return NextResponse.json({ cieMarks: updated });
    } else {
      const cieMarks = cieMarksRepository.create({
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        facultyId: faculty.id,
        marksObtained: parseInt(marksObtained),
        maxMarks: subject.maxCIE,
      });

      const saved = await cieMarksRepository.save(cieMarks);

      await logAudit(
        req.user!.userId,
        req.user!.email,
        req.user!.role,
        AuditAction.CREATE,
        'CIEMarks',
        saved.id,
        `Created CIE marks for student ${studentId}`,
        req
      );

      return NextResponse.json({ cieMarks: saved }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating CIE marks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withRole([UserRole.FACULTY])(postHandler);
