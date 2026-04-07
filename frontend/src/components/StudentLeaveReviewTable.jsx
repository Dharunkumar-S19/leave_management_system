import React, { useState } from 'react';
import { CheckCircle2, XCircle, FileText, ChevronRight } from 'lucide-react';
import staffService from '../services/staffService';
import { toast } from 'react-hot-toast';
import RemarksModal from './RemarksModal';

const StudentLeaveReviewTable = ({ requests, onActionComplete }) => {
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'forward' | 'reject'
  const [loadingAction, setLoadingAction] = useState(false);

  const openModal = (leave, action) => {
    setSelectedLeave(leave);
    setModalAction(action);
  };

  const handleAction = async (remarks) => {
    setLoadingAction(true);
    try {
      if (modalAction === 'forward') {
        await staffService.forwardStudentLeave(selectedLeave.id, remarks);
        toast.success(`Request forwarded to HOD for ${selectedLeave.student_name}`);
      } else {
        await staffService.rejectStudentLeave(selectedLeave.id, remarks);
        toast.success(`Request rejected for ${selectedLeave.student_name}`);
      }
      onActionComplete();
      setSelectedLeave(null);
      setModalAction(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoadingAction(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-gray-400 font-bold">No pending student requests to review.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wider font-bold text-gray-500">
              <tr>
                <th className="px-6 py-4 text-left">Student</th>
                <th className="px-6 py-4 text-left">Type</th>
                <th className="px-6 py-4 text-left">Dates</th>
                <th className="px-6 py-4 text-left">Reason</th>
                <th className="px-6 py-4 text-left">Attachment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-black text-gray-900">{req.student_name}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{req.roll_number} • {req.class}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-black uppercase tracking-widest ${req.leave_type === 'CL' ? 'text-blue-600' : req.leave_type === 'ML' ? 'text-red-600' : 'text-green-600'}`}>
                      {req.leave_type} <span className="text-gray-400 font-medium">({req.days_count}d)</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                    {formatDate(req.from_date)} - {formatDate(req.to_date)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate" title={req.reason}>
                    {req.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {req.attachment_url ? (
                      <a href={req.attachment_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center font-bold text-xs" title="View Document">
                        <FileText size={16} className="mr-1" /> View
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => openModal(req, 'reject')}
                      className="inline-flex items-center justify-center p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
                      title="Reject"
                    >
                      <XCircle size={20} />
                    </button>
                    <button
                      onClick={() => openModal(req, 'forward')}
                      className="inline-flex items-center justify-center px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-green-200 transition-all active:scale-95 transition-transform"
                    >
                      Forward <ChevronRight size={14} className="ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RemarksModal
        isOpen={!!selectedLeave}
        onClose={() => { setSelectedLeave(null); setModalAction(null); }}
        actionType={modalAction}
        loading={loadingAction}
        onSubmit={handleAction}
      />
    </>
  );
};

export default StudentLeaveReviewTable;
