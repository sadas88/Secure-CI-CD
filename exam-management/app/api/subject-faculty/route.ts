import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { SubjectFacultyMapping } from '@/lib/entities/SubjectFacultyMapping';
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
    const subjectId = searchParams.get('subjectId');
    const facultyId = searchParams.get('facultyId');

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(SubjectFacultyMapping);
    
    const where: any = {};
    if (subjectId) where.subjectId = parseInt(subjectId);
    if (facultyId) where.facultyId = parseInt(facultyId);

    const mappings = await repository.find({
      where,
      relations: ['subject', 'faculty'],
    });

    return NextResponse.json(mappings);
  } catch (error: any) {
    console.error('Error fetching subject-faculty mappings:', error);
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
    const { subjectId, facultyId } = body;

    if (!subjectId || !facultyId) {
      return NextResponse.json({ error: 'Subject ID and Faculty ID are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repository = dataSource.getRepository(SubjectFacultyMapping);

    const mapping = repository.create({
      subjectId: parseInt(subjectId),
      facultyId: parseInt(facultyId),
    });

    const saved = await repository.save(mapping);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.CREATE,
      'SubjectFacultyMapping',
      saved.id,
      { subjectId, facultyId }
    );

    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subject-faculty mapping:', error);
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
    const repository = dataSource.getRepository(SubjectFacultyMapping);
    const mapping = await repository.findOne({ where: { id: parseInt(id) } });

    if (!mapping) {
      return NextResponse.json({ error: 'Mapping not found' }, { status: 404 });
    }

    await repository.remove(mapping);

    await createAuditLog(
      auth.user.id,
      auth.user.email,
      AuditAction.DELETE,
      'SubjectFacultyMapping',
      parseInt(id),
      {}
    );

    return NextResponse.json({ message: 'Mapping deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting subject-faculty mapping:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
