import { getDataSource } from './database';
import { AuditLog, AuditAction } from './entities/AuditLog';
import { getClientIp, getUserAgent } from './security';

export async function logAudit(
  userId: number,
  userEmail: string,
  userRole: string,
  action: AuditAction,
  entityType: string,
  entityId?: number,
  description?: string,
  req?: any
): Promise<void> {
  try {
    const dataSource = await getDataSource();
    const auditLogRepository = dataSource.getRepository(AuditLog);

    const auditLog = auditLogRepository.create({
      userId,
      userEmail,
      userRole,
      action,
      entityType,
      entityId,
      description,
      ipAddress: req ? getClientIp(req) : undefined,
      userAgent: req ? getUserAgent(req) : undefined,
    });

    await auditLogRepository.save(auditLog);
  } catch (error) {
    console.error('Failed to log audit:', error);
    // Don't throw - audit logging should not break the main flow
  }
}
