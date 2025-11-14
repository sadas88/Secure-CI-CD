import { getDataSource } from './database';
import { User, UserRole } from './entities/User';
import * as jwt from 'jsonwebtoken';
import { AuditLog, AuditAction } from './entities/AuditLog';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export async function createToken(user: User): Promise<string> {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: User; token: string } | null> {
  const dataSource = await getDataSource();
  const userRepository = dataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { email, isActive: true },
  });

  if (!user) {
    return null;
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return null;
  }

  // Update last login
  user.lastLoginAt = new Date();
  await userRepository.save(user);

  // Create audit log
  const auditLogRepository = dataSource.getRepository(AuditLog);
  await auditLogRepository.save({
    userId: user.id,
    userEmail: user.email,
    action: AuditAction.LOGIN,
    entityType: 'User',
    entityId: user.id,
    ipAddress,
    userAgent,
  });

  const token = await createToken(user);
  return { user, token };
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  const dataSource = await getDataSource();
  const userRepository = dataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { id: payload.userId, isActive: true },
  });

  return user || null;
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
  }
  return { valid: true };
}

export async function createAuditLog(
  userId: number,
  userEmail: string,
  action: AuditAction,
  entityType: string,
  entityId: number | null = null,
  details: any = null,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const dataSource = await getDataSource();
  const auditLogRepository = dataSource.getRepository(AuditLog);

  await auditLogRepository.save({
    userId,
    userEmail,
    action,
    entityType,
    entityId,
    details: details ? JSON.stringify(details) : null,
    ipAddress,
    userAgent,
  });
}
