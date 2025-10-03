import { supabase } from '../lib/supabase';
import { User, LORRequest, Notification } from '../types';

export const supabaseApi = {
  async signup(email: string, password: string, fullName: string, role: 'student' | 'faculty', department?: string): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          department: department || null,
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        role,
        full_name: fullName,
        department: department || null,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    return {
      id: authData.user.id,
      email,
      role,
      fullName,
      department,
    };
  },

  async login(email: string, password: string): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Login failed');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      fullName: profile.full_name,
      department: profile.department || undefined,
    };
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      fullName: profile.full_name,
      department: profile.department || undefined,
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getRequests(userId: string, role: 'student' | 'faculty'): Promise<LORRequest[]> {
    const column = role === 'student' ? 'student_id' : 'faculty_id';

    const { data, error } = await supabase
      .from('lor_requests')
      .select(`
        *,
        student:profiles!lor_requests_student_id_fkey(full_name),
        faculty:profiles!lor_requests_faculty_id_fkey(full_name)
      `)
      .eq(column, userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((req: any) => ({
      id: req.id,
      studentId: req.student_id,
      studentName: req.student.full_name,
      facultyId: req.faculty_id,
      facultyName: req.faculty.full_name,
      program: req.program,
      university: req.university,
      purpose: req.purpose,
      deadline: req.deadline,
      details: req.details,
      status: req.status,
      aiDraft: req.ai_draft,
      finalLor: req.final_lor,
      createdAt: req.created_at,
      updatedAt: req.updated_at,
    }));
  },

  async createRequest(request: Omit<LORRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LORRequest> {
    const { data, error } = await supabase
      .from('lor_requests')
      .insert({
        student_id: request.studentId,
        faculty_id: request.facultyId,
        program: request.program,
        university: request.university,
        purpose: request.purpose,
        deadline: request.deadline,
        details: request.details,
        status: 'pending',
      })
      .select(`
        *,
        student:profiles!lor_requests_student_id_fkey(full_name),
        faculty:profiles!lor_requests_faculty_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: request.facultyId,
      request_id: data.id,
      message: `New LOR request from ${request.studentName}`,
      is_read: false,
    });

    return {
      id: data.id,
      studentId: data.student_id,
      studentName: data.student.full_name,
      facultyId: data.faculty_id,
      facultyName: data.faculty.full_name,
      program: data.program,
      university: data.university,
      purpose: data.purpose,
      deadline: data.deadline,
      details: data.details,
      status: data.status,
      aiDraft: data.ai_draft,
      finalLor: data.final_lor,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateRequestStatus(requestId: string, status: LORRequest['status']): Promise<LORRequest> {
    const { data, error } = await supabase
      .from('lor_requests')
      .update({ status })
      .eq('id', requestId)
      .select(`
        *,
        student:profiles!lor_requests_student_id_fkey(full_name),
        faculty:profiles!lor_requests_faculty_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      studentId: data.student_id,
      studentName: data.student.full_name,
      facultyId: data.faculty_id,
      facultyName: data.faculty.full_name,
      program: data.program,
      university: data.university,
      purpose: data.purpose,
      deadline: data.deadline,
      details: data.details,
      status: data.status,
      aiDraft: data.ai_draft,
      finalLor: data.final_lor,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async generateDraft(requestId: string): Promise<LORRequest> {
    const { data: request, error: fetchError } = await supabase
      .from('lor_requests')
      .select(`
        *,
        student:profiles!lor_requests_student_id_fkey(full_name),
        faculty:profiles!lor_requests_faculty_id_fkey(full_name)
      `)
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    const aiDraft = `To the Admissions Committee,

I am writing to enthusiastically recommend ${request.student.full_name} for admission to the ${request.program} at ${request.university}.

${request.student.full_name} has demonstrated exceptional academic prowess and a strong commitment to their field of study. During their time in my ${request.purpose.toLowerCase()}, they consistently exhibited qualities that mark them as an outstanding candidate.

Their dedication to ${request.details.substring(0, 100)}... has been particularly impressive. I have observed their ability to tackle complex problems with creativity and analytical rigor.

I wholeheartedly recommend ${request.student.full_name} for your program and am confident they will make significant contributions to your academic community.

Sincerely,
${request.faculty.full_name}`;

    const { data, error } = await supabase
      .from('lor_requests')
      .update({ ai_draft: aiDraft })
      .eq('id', requestId)
      .select(`
        *,
        student:profiles!lor_requests_student_id_fkey(full_name),
        faculty:profiles!lor_requests_faculty_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      studentId: data.student_id,
      studentName: data.student.full_name,
      facultyId: data.faculty_id,
      facultyName: data.faculty.full_name,
      program: data.program,
      university: data.university,
      purpose: data.purpose,
      deadline: data.deadline,
      details: data.details,
      status: data.status,
      aiDraft: data.ai_draft,
      finalLor: data.final_lor,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateDraft(requestId: string, draft: string): Promise<LORRequest> {
    const { data, error } = await supabase
      .from('lor_requests')
      .update({ ai_draft: draft })
      .eq('id', requestId)
      .select(`
        *,
        student:profiles!lor_requests_student_id_fkey(full_name),
        faculty:profiles!lor_requests_faculty_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      studentId: data.student_id,
      studentName: data.student.full_name,
      facultyId: data.faculty_id,
      facultyName: data.faculty.full_name,
      program: data.program,
      university: data.university,
      purpose: data.purpose,
      deadline: data.deadline,
      details: data.details,
      status: data.status,
      aiDraft: data.ai_draft,
      finalLor: data.final_lor,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async approveLOR(requestId: string): Promise<LORRequest> {
    const { data: request, error: fetchError } = await supabase
      .from('lor_requests')
      .select('ai_draft')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('lor_requests')
      .update({
        final_lor: request.ai_draft,
        status: 'approved',
      })
      .eq('id', requestId)
      .select(`
        *,
        student:profiles!lor_requests_student_id_fkey(full_name),
        faculty:profiles!lor_requests_faculty_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      studentId: data.student_id,
      studentName: data.student.full_name,
      facultyId: data.faculty_id,
      facultyName: data.faculty.full_name,
      program: data.program,
      university: data.university,
      purpose: data.purpose,
      deadline: data.deadline,
      details: data.details,
      status: data.status,
      aiDraft: data.ai_draft,
      finalLor: data.final_lor,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((n) => ({
      id: n.id,
      userId: n.user_id,
      requestId: n.request_id || '',
      message: n.message,
      isRead: n.is_read,
      createdAt: n.created_at,
    }));
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getFacultyList(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'faculty');

    if (error) throw error;

    return data.map((p) => ({
      id: p.id,
      email: p.email,
      role: p.role,
      fullName: p.full_name,
      department: p.department || undefined,
    }));
  },
};
