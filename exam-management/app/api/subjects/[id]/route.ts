import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Subject } from '@/lib/entities/Subject';
import { requireRole } from '@/lib/middleware/auth';
import { UserRole } from '@/lib/entities/User';
import { authenticateRequest } from '@/lib/middleware/auth';
import { createAuditLog } from '@/lib/auth';
import { AuditAction } from '@/lib/entities/AuditLog';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Subject);
    const subject = await repository.findOne({ where: { id: parseInt(id) } });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (error: any) {
    console.error('Error fetching subject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireRole([UserRole.ADMIN])(request);
    if (authCheck) return authCheck;

    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Subject);
    const subject = await repository.findOne({ where: { id: parseInt(id) } });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    const { maxCIE, maxSEE, totalMarks } = body;
    if (maxCIE !== undefined && maxSEE !== undefined && totalMarks !== undefined) {
      if (maxCIE + maxSEE > totalMarks) {
        return NextResponse.json(
          { error: 'CIE + SEE cannot exceed Total Marks' },
          { status: 400 }
        );
      }
    }

    Object.assign(subject, body);
    const updated = await repository.save(subject);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.UPDATE,
      'Subject',
      updated.id,
      body
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireRole([UserRole.ADMIN])(request);
    if (authCheck) return authCheck;

    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(Subject);
    const subject = await repository.findOne({ where: { id: parseInt(id) } });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    await repository.remove(subject);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.DELETE,
      'Subject',
      parseInt(id),
      { subjectCode: subject.subjectCode }
    );

    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
