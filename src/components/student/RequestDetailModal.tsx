import React from 'react';
import { LORRequest } from '../../types';
import { X, Calendar, User, Building2, FileText } from 'lucide-react';

interface RequestDetailModalProps {
  request: LORRequest;
  onClose: () => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ request, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Building2 className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">University</p>
                <p className="font-semibold text-gray-900">{request.university}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Program</p>
                <p className="font-semibold text-gray-900">{request.program}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Faculty</p>
                <p className="font-semibold text-gray-900">{request.facultyName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-red-600 mt-0.5" />
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
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Purpose</h3>
            <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{request.purpose}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h3>
            <p className="text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
              {request.details}
            </p>
          </div>

          {request.aiDraft && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Letter Preview</h3>
              <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-lg p-6">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {request.aiDraft}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
