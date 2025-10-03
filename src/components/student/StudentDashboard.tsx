import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LORRequest } from '../../types';
import { api } from '../../services/api';
import { RequestForm } from './RequestForm';
import { RequestList } from './RequestList';
import { Layout } from '../Layout';
import { Plus, List } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LORRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');

  const loadRequests = async () => {
    if (user) {
      setLoading(true);
      try {
        const data = await api.getRequests(user.id, 'student');
        setRequests(data);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const handleRequestSubmitted = () => {
    setView('list');
    loadRequests();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">Manage your letter of recommendation requests</p>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'list'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-red-300'
            }`}
          >
            <List className="w-5 h-5" />
            My Requests
          </button>
          <button
            onClick={() => setView('form')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'form'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-red-300'
            }`}
          >
            <Plus className="w-5 h-5" />
            New Request
          </button>
        </div>

        {view === 'list' ? (
          <RequestList requests={requests} loading={loading} onRefresh={loadRequests} />
        ) : (
          <RequestForm onSubmit={handleRequestSubmitted} onCancel={() => setView('list')} />
        )}
      </div>
    </Layout>
  );
};
