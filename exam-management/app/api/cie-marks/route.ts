import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { CIEMark } from '@/lib/entities/CIEMark';
import { Subject } from '@/lib/entities/Subject';
import { requireRole } from '@/lib/middleware/auth';
import { UserRole } from '@/lib/entities/User';
import { authenticateRequest } from '@/lib/middleware/auth';
import { createAuditLog } from '@/lib/auth';
import { AuditAction } from '@/lib/entities/AuditLog';
import { validateCIESEE } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(CIEMark);
    
    const where: any = {};
    if (studentId) where.studentId = parseInt(studentId);
    if (subjectId) where.subjectId = parseInt(subjectId);

    const marks = await repository.find({
      where,
      relations: ['student', 'subject'],
    });

    return NextResponse.json(marks);
  } catch (error: any) {
    console.error('Error fetching CIE marks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole([UserRole.FACULTY])(request);
    if (authCheck) return authCheck;

    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, subjectId, cieMarks, seeMarks } = body;

    if (!studentId || !subjectId || cieMarks === undefined) {
      return NextResponse.json({ error: 'Student ID, Subject ID, and CIE marks are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const subjectRepository = dataSource.getRepository(Subject);
    const subject = await subjectRepository.findOne({ where: { id: parseInt(subjectId) } });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    const validation = validateCIESEE(subject, parseInt(cieMarks), seeMarks ? parseInt(seeMarks) : null);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const repository = dataSource.getRepository(CIEMark);
    const totalMarks = cieMarks + (seeMarks || 0);

    const cieMark = repository.create({
      studentId: parseInt(studentId),
      subjectId: parseInt(subjectId),
      cieMarks: parseInt(cieMarks),
      seeMarks: seeMarks ? parseInt(seeMarks) : null,
      totalMarks,
      createdBy: auth.user.id,
    });

    const saved = await repository.save(cieMark);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.CREATE,
      'CIEMark',
      saved.id,
      { studentId, subjectId, cieMarks, seeMarks }
    );

    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error creating CIE marks:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'CIE marks for this student and subject already exist' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = await requireRole([UserRole.FACULTY])(request);
    if (authCheck) return authCheck;

    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, cieMarks, seeMarks } = body;

    if (!id || cieMarks === undefined) {
      return NextResponse.json({ error: 'ID and CIE marks are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(CIEMark);
    const cieMark = await repository.findOne({
      where: { id: parseInt(id) },
      relations: ['subject'],
    });

    if (!cieMark) {
      return NextResponse.json({ error: 'CIE marks not found' }, { status: 404 });
    }

    const validation = validateCIESEE(cieMark.subject, parseInt(cieMarks), seeMarks ? parseInt(seeMarks) : null);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    cieMark.cieMarks = parseInt(cieMarks);
    cieMark.seeMarks = seeMarks ? parseInt(seeMarks) : null;
    cieMark.totalMarks = parseInt(cieMarks) + (seeMarks ? parseInt(seeMarks) : 0);

    const updated = await repository.save(cieMark);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.UPDATE,
      'CIEMark',
      updated.id,
      { cieMarks, seeMarks }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating CIE marks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
