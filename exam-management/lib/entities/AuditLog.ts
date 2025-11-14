import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

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

  @Column({
    type: 'text',
  })
  action!: AuditAction;

  @Column()
  entityType!: string; // e.g., 'Subject', 'Student', 'Attendance'

  @Column({ nullable: true })
  entityId!: number | null;

  @Column({ type: 'text', nullable: true })
  details!: string | null; // JSON string of changes

  @Column({ nullable: true })
  ipAddress!: string | null;

  @Column({ nullable: true })
  userAgent!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
