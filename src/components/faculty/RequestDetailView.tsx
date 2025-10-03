import React, { useState } from 'react';
import { LORRequest } from '../../types';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { ArrowLeft, Check, X, Sparkles, Save, Send, Calendar, User, Building2, FileText } from 'lucide-react';

interface RequestDetailViewProps {
  request: LORRequest;
  onBack: () => void;
  onUpdate: () => void;
}

export const RequestDetailView: React.FC<RequestDetailViewProps> = ({ request, onBack, onUpdate }) => {
  const { showToast } = useNotifications();
  const [draft, setDraft] = useState(request.aiDraft || '');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleGenerateDraft = async () => {
    setLoading(true);
    try {
      const updated = await api.generateDraft(request.id);
      setDraft(updated.aiDraft || '');
      showToast('AI draft generated successfully!');
    } catch (err) {
      showToast('Failed to generate draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      await api.updateDraft(request.id, draft);
      setEditing(false);
      showToast('Draft saved successfully!');
    } catch (err) {
      showToast('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await api.updateRequestStatus(request.id, 'in_review');
      showToast('Request accepted and moved to In Review');
      onUpdate();
    } catch (err) {
      showToast('Failed to accept request');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!window.confirm('Are you sure you want to decline this request?')) return;

    setLoading(true);
    try {
      await api.updateRequestStatus(request.id, 'declined');
      showToast('Request declined');
      onUpdate();
    } catch (err) {
      showToast('Failed to decline request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!draft.trim()) {
      showToast('Please generate and review the draft before approving');
      return;
    }

    setLoading(true);
    try {
      await api.approveLOR(request.id);
      showToast('LOR approved and released to student!');
      onUpdate();
    } catch (err) {
      showToast('Failed to approve LOR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold mb-6 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{request.studentName}</h1>
          <p className="text-red-100 text-lg">{request.program}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Building2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">University</p>
                <p className="font-semibold text-gray-900">{request.university}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Purpose</p>
                <p className="font-semibold text-gray-900">{request.purpose}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Deadline</p>
                <p className="font-semibold text-gray-900">
                  {new Date(request.deadline).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {request.status.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Student's Message</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{request.details}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Letter of Recommendation</h3>
              <div className="flex gap-2">
                {!draft && (
                  <button
                    onClick={handleGenerateDraft}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30"
                  >
                    <Sparkles className="w-4 h-4" />
                    {loading ? 'Generating...' : 'Generate AI Draft'}
                  </button>
                )}
                {draft && !editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
                  >
                    Edit Draft
                  </button>
                )}
                {editing && (
                  <button
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            {draft ? (
              <div className="bg-gradient-to-br from-red-50 to-white border-2 border-red-200 rounded-lg p-6">
                {editing ? (
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-serif text-gray-800 leading-relaxed"
                  />
                ) : (
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-serif">
                    {draft}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  No draft generated yet. Click "Generate AI Draft" to create one.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 flex gap-3">
            {request.status === 'pending' && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-green-600/30"
                >
                  <Check className="w-5 h-5" />
                  Accept Request
                </button>
                <button
                  onClick={handleDecline}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-red-600/30"
                >
                  <X className="w-5 h-5" />
                  Decline Request
                </button>
              </>
            )}

            {request.status === 'in_review' && draft && (
              <button
                onClick={handleApprove}
                disabled={loading || editing}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-red-600/30"
              >
                <Send className="w-5 h-5" />
                Approve & Release to Student
              </button>
            )}

            {request.status === 'approved' && (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 font-semibold rounded-lg border-2 border-green-300">
                <CheckCircle className="w-5 h-5" />
                LOR Approved & Released
              </div>
            )}

            {request.status === 'declined' && (
              <div className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-800 font-semibold rounded-lg border-2 border-red-300">
                <X className="w-5 h-5" />
                Request Declined
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
