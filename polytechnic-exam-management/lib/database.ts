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
import { CIEMarks } from './entities/CIEMarks';
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
    CIEMarks,
    AuditLog,
  ],
});

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (!dataSource) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    dataSource = AppDataSource;
  }
  return dataSource;
}
