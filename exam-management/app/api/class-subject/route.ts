import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { ClassSubjectMapping } from '@/lib/entities/ClassSubjectMapping';
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

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(ClassSubjectMapping);
    
    const where: any = {};
    if (classId) where.classId = parseInt(classId);
    if (subjectId) where.subjectId = parseInt(subjectId);

    const mappings = await repository.find({
      where,
      relations: ['class', 'class.branch', 'class.semester', 'subject'],
    });

    return NextResponse.json(mappings);
  } catch (error: any) {
    console.error('Error fetching class-subject mappings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole([UserRole.ADMIN, UserRole.HOD])(request);
    if (authCheck) return authCheck;

    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { classId, subjectId } = body;

    if (!classId || !subjectId) {
      return NextResponse.json({ error: 'Class ID and Subject ID are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(ClassSubjectMapping);

    const mapping = repository.create({
      classId: parseInt(classId),
      subjectId: parseInt(subjectId),
    });

    const saved = await repository.save(mapping);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.CREATE,
      'ClassSubjectMapping',
      saved.id,
      { classId, subjectId }
    );

    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error creating class-subject mapping:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Mapping already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await requireRole([UserRole.ADMIN, UserRole.HOD])(request);
    if (authCheck) return authCheck;

    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(ClassSubjectMapping);
    const mapping = await repository.findOne({ where: { id: parseInt(id) } });

    if (!mapping) {
      return NextResponse.json({ error: 'Mapping not found' }, { status: 404 });
    }

    await repository.remove(mapping);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.DELETE,
      'ClassSubjectMapping',
      parseInt(id),
      {}
    );

    return NextResponse.json({ message: 'Mapping deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting class-subject mapping:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
