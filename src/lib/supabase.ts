import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'student' | 'faculty';
          full_name: string;
          department: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: 'student' | 'faculty';
          full_name: string;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'student' | 'faculty';
          full_name?: string;
          department?: string | null;
          updated_at?: string;
        };
      };
      lor_requests: {
        Row: {
          id: string;
          student_id: string;
          faculty_id: string;
          program: string;
          university: string;
          purpose: string;
          deadline: string;
          details: string;
          status: 'pending' | 'in_review' | 'approved' | 'declined';
          ai_draft: string | null;
          final_lor: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          faculty_id: string;
          program: string;
          university: string;
          purpose: string;
          deadline: string;
          details: string;
          status?: 'pending' | 'in_review' | 'approved' | 'declined';
          ai_draft?: string | null;
          final_lor?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'in_review' | 'approved' | 'declined';
          ai_draft?: string | null;
          final_lor?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          request_id: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          request_id?: string | null;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
  };
}
