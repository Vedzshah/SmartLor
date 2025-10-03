import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LORRequest } from '../../types';
import { api } from '../../services/api';
import { Layout } from '../Layout';
import { Clock, FileText, CheckCircle, XCircle } from 'lucide-react';
import { RequestCard } from './RequestCard';
import { RequestDetailView } from './RequestDetailView';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LORRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LORRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_review' | 'approved' | 'declined'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadRequests = async () => {
    if (user) {
      setLoading(true);
      try {
        const data = await api.getRequests(user.id, 'faculty');
        setRequests(data);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const handleRequestUpdated = () => {
    loadRequests();
    setSelectedRequest(null);
  };

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    in_review: requests.filter(r => r.status === 'in_review').length,
    approved: requests.filter(r => r.status === 'approved').length,
    declined: requests.filter(r => r.status === 'declined').length
  };

  const filteredRequests = requests
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r =>
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.university.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (selectedRequest) {
    return (
      <Layout>
        <RequestDetailView
          request={selectedRequest}
          onBack={() => setSelectedRequest(null)}
          onUpdate={handleRequestUpdated}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Dashboard</h1>
          <p className="text-gray-600">Review and manage letter of recommendation requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">Pending Review</p>
                <p className="text-4xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">In Review</p>
                <p className="text-4xl font-bold text-blue-900">{stats.in_review}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">Approved</p>
                <p className="text-4xl font-bold text-green-900">{stats.approved}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-white border-2 border-red-200 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800 mb-1">Declined</p>
                <p className="text-4xl font-bold text-red-900">{stats.declined}</p>
              </div>
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-red-100 mb-6 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, program, or university..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            />

            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'in_review', 'approved', 'declined'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    filter === status
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-lg border border-red-100 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-red-100 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your filters or search term'
                : 'No LOR requests have been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onClick={() => setSelectedRequest(request)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
