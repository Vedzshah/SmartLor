export interface User {
  id: string;
  email: string;
  role: 'student' | 'faculty';
  fullName: string;
  department?: string;
}

export interface LORRequest {
  id: string;
  studentId: string;
  studentName: string;
  facultyId: string;
  facultyName: string;
  program: string;
  university: string;
  purpose: string;
  deadline: string;
  details: string;
  status: 'pending' | 'in_review' | 'approved' | 'declined';
  aiDraft?: string;
  finalLor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  requestId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, role: 'student' | 'faculty', department?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
