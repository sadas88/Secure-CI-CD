import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/middleware';
import { getDataSource } from '@/lib/database';
import { Branch } from '@/lib/entities/Branch';
import { UserRole } from '@/lib/entities/User';
import { logAudit, AuditAction } from '@/lib/audit';

async function getHandler(req: AuthenticatedRequest) {
  try {
    const dataSource = await getDataSource();
    const branchRepository = dataSource.getRepository(Branch);

    const branches = await branchRepository.find({
      where: { isActive: true },
      order: { branchCode: 'ASC' },
    });

    return NextResponse.json({ branches });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function postHandler(req: AuthenticatedRequest) {
  try {
    const data = await req.json();
    const { branchCode, branchName } = data;

    if (!branchCode || !branchName) {
      return NextResponse.json({ error: 'Branch code and name are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const branchRepository = dataSource.getRepository(Branch);

    const existing = await branchRepository.findOne({ where: { branchCode } });
    if (existing) {
      return NextResponse.json({ error: 'Branch code already exists' }, { status: 400 });
    }

    const branch = branchRepository.create({
      branchCode: branchCode.toUpperCase(),
      branchName,
    });

    const savedBranch = await branchRepository.save(branch);

    await logAudit(
      req.user!.userId,
      req.user!.email,
      req.user!.role,
      AuditAction.CREATE,
      'Branch',
      savedBranch.id,
      `Created branch: ${branchCode}`,
      req
    );

    return NextResponse.json({ branch: savedBranch }, { status: 201 });
  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withRole([UserRole.ADMIN])(postHandler);
