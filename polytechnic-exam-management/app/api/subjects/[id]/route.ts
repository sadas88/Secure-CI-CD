import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/middleware';
import { getDataSource } from '@/lib/database';
import { Subject } from '@/lib/entities/Subject';
import { UserRole } from '@/lib/entities/User';
import { logAudit, AuditAction } from '@/lib/audit';

// GET - Get single subject
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (authReq: AuthenticatedRequest) => {
    try {
      const params = await context.params;
      const dataSource = await getDataSource();
      const subjectRepository = dataSource.getRepository(Subject);

      const subject = await subjectRepository.findOne({ where: { id: parseInt(params.id) } });

      if (!subject) {
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
      }

      return NextResponse.json({ subject });
    } catch (error) {
      console.error('Error fetching subject:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  })(req);
}

// PUT - Update subject (Admin only)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withRole([UserRole.ADMIN])(async (authReq: AuthenticatedRequest) => {
    try {
      const params = await context.params;
      const data = await req.json();
      const dataSource = await getDataSource();
      const subjectRepository = dataSource.getRepository(Subject);

      const subject = await subjectRepository.findOne({ where: { id: parseInt(params.id) } });

      if (!subject) {
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
      }

      if (data.maxCIE && data.maxSEE && data.totalMarks) {
        if (data.maxCIE + data.maxSEE > data.totalMarks) {
          return NextResponse.json({ error: 'CIE + SEE cannot exceed Total Marks' }, { status: 400 });
        }
      }

      Object.assign(subject, data);
      const updatedSubject = await subjectRepository.save(subject);

      await logAudit(
        authReq.user!.userId,
        authReq.user!.email,
        authReq.user!.role,
        AuditAction.UPDATE,
        'Subject',
        updatedSubject.id,
        `Updated subject: ${updatedSubject.subjectCode}`,
        authReq
      );

      return NextResponse.json({ subject: updatedSubject });
    } catch (error) {
      console.error('Error updating subject:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  })(req);
}

// DELETE - Delete subject (Admin only)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withRole([UserRole.ADMIN])(async (authReq: AuthenticatedRequest) => {
    try {
      const params = await context.params;
      const dataSource = await getDataSource();
      const subjectRepository = dataSource.getRepository(Subject);

      const subject = await subjectRepository.findOne({ where: { id: parseInt(params.id) } });

      if (!subject) {
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
      }

      await subjectRepository.remove(subject);

      await logAudit(
        authReq.user!.userId,
        authReq.user!.email,
        authReq.user!.role,
        AuditAction.DELETE,
        'Subject',
        parseInt(params.id),
        `Deleted subject: ${subject.subjectCode}`,
        authReq
      );

      return NextResponse.json({ message: 'Subject deleted successfully' });
    } catch (error) {
      console.error('Error deleting subject:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  })(req);
}
