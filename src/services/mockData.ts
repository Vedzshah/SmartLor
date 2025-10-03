import { User, LORRequest, Notification } from '../types';

export const mockUsers: User[] = [
  {
    id: 'student-1',
    email: 'student@test.com',
    role: 'student',
    fullName: 'John Doe',
    department: 'Computer Science'
  },
  {
    id: 'faculty-1',
    email: 'faculty@test.com',
    role: 'faculty',
    fullName: 'Dr. Jane Smith',
    department: 'Computer Science'
  },
  {
    id: 'faculty-2',
    email: 'faculty2@test.com',
    role: 'faculty',
    fullName: 'Dr. Robert Johnson',
    department: 'Mathematics'
  }
];

export const mockRequests: LORRequest[] = [
  {
    id: 'req-1',
    studentId: 'student-1',
    studentName: 'John Doe',
    facultyId: 'faculty-1',
    facultyName: 'Dr. Jane Smith',
    program: 'Master of Science in Computer Science',
    university: 'Stanford University',
    purpose: 'Graduate School Application',
    deadline: '2025-12-01',
    details: 'I am applying for the MS CS program specializing in AI/ML. I took your Advanced Algorithms course and completed a research project on neural networks.',
    status: 'pending',
    createdAt: '2025-09-15T10:00:00Z',
    updatedAt: '2025-09-15T10:00:00Z'
  }
];

export const mockNotifications: Notification[] = [];

export const generateAIDraft = (request: LORRequest): string => {
  return `To the Admissions Committee,

I am writing to enthusiastically recommend ${request.studentName} for admission to the ${request.program} at ${request.university}.

${request.studentName} has demonstrated exceptional academic prowess and a strong commitment to their field of study. During their time in my ${request.purpose.toLowerCase()}, they consistently exhibited qualities that mark them as an outstanding candidate.

Their dedication to ${request.details.substring(0, 100)}... has been particularly impressive. I have observed their ability to tackle complex problems with creativity and analytical rigor.

I wholeheartedly recommend ${request.studentName} for your program and am confident they will make significant contributions to your academic community.

Sincerely,
${request.facultyName}`;
};
