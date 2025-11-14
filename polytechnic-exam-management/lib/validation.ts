// Validation rules

export function validateCIEMarks(cieMarks: number, seeMarks: number, totalMarks: number): boolean {
  return cieMarks + seeMarks <= totalMarks;
}

export function validateAttendancePercentage(attended: number, total: number): number {
  if (total === 0) return 0;
  return (attended / total) * 100;
}

export const ATTENDANCE_THRESHOLD = 75; // 75% as specified

export function isLowAttendance(percentage: number): boolean {
  return percentage < ATTENDANCE_THRESHOLD;
}
