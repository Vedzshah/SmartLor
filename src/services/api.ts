import { supabaseApi } from './supabaseApi';

export const api = supabaseApi;

export const legacyApi = {
  async login(email: string, password: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = getStorageData();
    const user = data.users.find(u => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    return user;
  },

  async signup(email: string, password: string, fullName: string, role: 'student' | 'faculty', department?: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = getStorageData();

    if (data.users.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: `${role}-${Date.now()}`,
      email,
      role,
      fullName,
      department
    };

    data.users.push(newUser);
    setStorageData(data);
    return newUser;
  },

  async getRequests(userId: string, role: 'student' | 'faculty'): Promise<LORRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getStorageData();

    if (role === 'student') {
      return data.requests.filter(r => r.studentId === userId);
    } else {
      return data.requests.filter(r => r.facultyId === userId);
    }
  },

  async createRequest(request: Omit<LORRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LORRequest> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = getStorageData();

    const newRequest: LORRequest = {
      ...request,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.requests.push(newRequest);
    setStorageData(data);

    const notification: Notification = {
      id: `notif-${Date.now()}`,
      userId: request.facultyId,
      requestId: newRequest.id,
      message: `New LOR request from ${request.studentName}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    data.notifications.push(notification);
    setStorageData(data);

    return newRequest;
  },

  async updateRequestStatus(requestId: string, status: LORRequest['status'], updatedBy: string): Promise<LORRequest> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = getStorageData();

    const requestIndex = data.requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error('Request not found');

    data.requests[requestIndex].status = status;
    data.requests[requestIndex].updatedAt = new Date().toISOString();

    const request = data.requests[requestIndex];

    const notification: Notification = {
      id: `notif-${Date.now()}`,
      userId: request.studentId,
      requestId: request.id,
      message: `Your LOR request has been ${status}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    data.notifications.push(notification);

    setStorageData(data);
    return request;
  },

  async generateDraft(requestId: string): Promise<LORRequest> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const data = getStorageData();

    const requestIndex = data.requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error('Request not found');

    const request = data.requests[requestIndex];
    data.requests[requestIndex].aiDraft = generateAIDraft(request);
    data.requests[requestIndex].updatedAt = new Date().toISOString();

    setStorageData(data);
    return data.requests[requestIndex];
  },

  async updateDraft(requestId: string, draft: string): Promise<LORRequest> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = getStorageData();

    const requestIndex = data.requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error('Request not found');

    data.requests[requestIndex].aiDraft = draft;
    data.requests[requestIndex].updatedAt = new Date().toISOString();

    setStorageData(data);
    return data.requests[requestIndex];
  },

  async approveLOR(requestId: string): Promise<LORRequest> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = getStorageData();

    const requestIndex = data.requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error('Request not found');

    data.requests[requestIndex].finalLor = data.requests[requestIndex].aiDraft;
    data.requests[requestIndex].status = 'approved';
    data.requests[requestIndex].updatedAt = new Date().toISOString();

    const request = data.requests[requestIndex];

    const notification: Notification = {
      id: `notif-${Date.now()}`,
      userId: request.studentId,
      requestId: request.id,
      message: `Your LOR has been approved by ${request.facultyName}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    data.notifications.push(notification);

    setStorageData(data);
    return data.requests[requestIndex];
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getStorageData();
    return data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getStorageData();

    const notifIndex = data.notifications.findIndex(n => n.id === notificationId);
    if (notifIndex !== -1) {
      data.notifications[notifIndex].isRead = true;
      setStorageData(data);
    }
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getStorageData();

    data.notifications
      .filter(n => n.userId === userId)
      .forEach(n => n.isRead = true);

    setStorageData(data);
  },

  async getFacultyList(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getStorageData();
    return data.users.filter(u => u.role === 'faculty');
  }
};
