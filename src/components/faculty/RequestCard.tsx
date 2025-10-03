import React from 'react';
import { LORRequest } from '../../types';
import { Clock, CheckCircle, XCircle, FileText, Calendar, User, ChevronRight } from 'lucide-react';

interface RequestCardProps {
  request: LORRequest;
  onClick: () => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onClick }) => {
  const getStatusBadge = (status: string) => {
    const config = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        icon: <Clock className="w-4 h-4" />
      },
      in_review: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        icon: <FileText className="w-4 h-4" />
      },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: <CheckCircle className="w-4 h-4" />
      },
      declined: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: <XCircle className="w-4 h-4" />
      }
    };

    const cfg = config[status as keyof typeof config];
    const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
        {cfg.icon}
        {label}
      </span>
    );
  };

  const isUrgent = new Date(request.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-red-100 rounded-xl p-6 hover:shadow-xl hover:border-red-300 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
              {request.studentName}
            </h3>
            {isUrgent && request.status === 'pending' && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                URGENT
              </span>
            )}
          </div>
          <p className="text-gray-600 font-medium">{request.program}</p>
          <p className="text-gray-500">{request.university}</p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(request.status)}
          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-500">Purpose</p>
            <p className="font-medium text-gray-900">{request.purpose}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-500">Deadline</p>
            <p className={`font-medium ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
              {new Date(request.deadline).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-500">Submitted</p>
            <p className="font-medium text-gray-900">
              {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
