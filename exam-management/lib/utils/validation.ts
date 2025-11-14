import { Subject } from '../entities/Subject';
import { CIEMark } from '../entities/CIEMark';

export function validateCIESEE(subject: Subject, cieMarks: number, seeMarks: number | null = null): {
  valid: boolean;
  message?: string;
} {
  if (cieMarks > subject.maxCIE) {
    return {
      valid: false,
      message: `CIE marks (${cieMarks}) cannot exceed maximum CIE (${subject.maxCIE})`,
    };
  }

  if (seeMarks !== null && seeMarks > subject.maxSEE) {
    return {
      valid: false,
      message: `SEE marks (${seeMarks}) cannot exceed maximum SEE (${subject.maxSEE})`,
    };
  }

  if (seeMarks !== null && cieMarks + seeMarks > subject.totalMarks) {
    return {
      valid: false,
      message: `Total marks (${cieMarks + seeMarks}) cannot exceed subject total marks (${subject.totalMarks})`,
    };
  }

  return { valid: true };
}

export function calculateAttendancePercentage(totalClasses: number, attendedClasses: number): number {
  if (totalClasses === 0) return 0;
  return (attendedClasses / totalClasses) * 100;
}

export const ATTENDANCE_THRESHOLD = 75;

export function isLowAttendance(percentage: number): boolean {
  return percentage < ATTENDANCE_THRESHOLD;
}
