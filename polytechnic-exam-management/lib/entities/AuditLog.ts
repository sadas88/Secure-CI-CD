import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  BULK_UPLOAD = 'bulk_upload',
  CLEAR_DATA = 'clear_data',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  userEmail!: string;

  @Column()
  userRole!: string;

  @Column({
    type: 'text',
    enum: AuditAction,
  })
  action!: AuditAction;

  @Column()
  entityType!: string; // e.g., "Subject", "Student", "Attendance"

  @Column({ nullable: true })
  entityId?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
