import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Subject } from '@/lib/entities/Subject';
import { requireRole } from '@/lib/middleware/auth';
import { UserRole } from '@/lib/entities/User';
import { authenticateRequest } from '@/lib/middleware/auth';
import { createAuditLog } from '@/lib/auth';
import { AuditAction } from '@/lib/entities/AuditLog';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Subject);
    const subjects = await repository.find({ order: { subjectCode: 'ASC' } });

    return NextResponse.json(subjects);
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole([UserRole.ADMIN])(request);
    if (authCheck) return authCheck;

    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scheme, subjectCode, subjectName, teachingDepartment, credits, maxCIE, maxSEE, totalMarks } = body;

    if (!scheme || !subjectCode || !subjectName || !teachingDepartment || !credits || maxCIE === undefined || maxSEE === undefined || totalMarks === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (maxCIE + maxSEE > totalMarks) {
      return NextResponse.json(
        { error: 'CIE + SEE cannot exceed Total Marks' },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Subject);

    const subject = repository.create({
      scheme,
      subjectCode,
      subjectName,
      teachingDepartment,
      credits: parseFloat(credits),
      maxCIE: parseInt(maxCIE),
      maxSEE: parseInt(maxSEE),
      totalMarks: parseInt(totalMarks),
    });

    const saved = await repository.save(subject);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.CREATE,
      'Subject',
      saved.id,
      { subjectCode, subjectName }
    );

    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subject:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Subject code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
