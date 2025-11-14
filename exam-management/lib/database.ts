import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Subject } from './entities/Subject';
import { Faculty } from './entities/Faculty';
import { Semester } from './entities/Semester';
import { Branch } from './entities/Branch';
import { Class } from './entities/Class';
import { Student } from './entities/Student';
import { SubjectFacultyMapping } from './entities/SubjectFacultyMapping';
import { ClassSubjectMapping } from './entities/ClassSubjectMapping';
import { Attendance } from './entities/Attendance';
import { CIEMark } from './entities/CIEMark';
import { AuditLog } from './entities/AuditLog';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  synchronize: true, // Set to false in production
  logging: false,
  entities: [
    User,
    Subject,
    Faculty,
    Semester,
    Branch,
    Class,
    Student,
    SubjectFacultyMapping,
    ClassSubjectMapping,
    Attendance,
    CIEMark,
    AuditLog,
  ],
});

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  if (!dataSource) {
    dataSource = AppDataSource;
  }

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  return dataSource;
}
