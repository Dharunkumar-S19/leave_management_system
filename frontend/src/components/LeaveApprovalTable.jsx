import React, { useState } from 'react';
import { CheckCircle2, XCircle, FileText, ChevronRight } from 'lucide-react';
import RemarksModal from './RemarksModal';

const LeaveApprovalTable = ({ requests, onApprove, onReject, reviewerRole }) => {
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'approve' | 'forward' | 'reject'
  const [loadingAction, setLoadingAction] = useState(false);

  // For HOD reviewing Staff, the action is technically "Forward" to Principal.
  // For HOD reviewing Student, it's "Approve" (Final).
  const getPositiveActionType = (req) => {
    if (reviewerRole === 'hod' && req.applicant_role === 'staff') return 'forward';
    return 'approve';
  };

  const getPositiveActionLabel = (actionType) => {
    return actionType === 'forward' ? 'Forward to Principal' : 'Approve';
  };

  const openModal = (leave, actionBase) => {
    setSelectedLeave(leave);
    setModalAction(actionBase === 'positive' ? getPositiveActionType(leave) : 'reject');
  };

  const handleAction = async (remarks) => {
    setLoadingAction(true);
    try {
      if (modalAction === 'reject') {
        await onReject(selectedLeave.id, remarks);
      } else {
        // Includes approve and forward
        await onApprove(selectedLeave.id, remarks);
      }
      setSelectedLeave(null);
      setModalAction(null);
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
        <p className="text-gray-400 font-bold">No pending requests to review.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50 text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-left">Applicant Identity</th>
                <th className="px-8 py-6 text-left">Leave Matrix</th>
                <th className="px-8 py-6 text-left">Temporal Range</th>
                <th className="px-8 py-6 text-left">Primary Reason</th>
                <th className="px-8 py-6 text-left">Documentation</th>
                <th className="px-8 py-6 text-right">System Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-indigo-50/10 transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{req.applicant_name}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mt-0.5">
                      {req.applicant_role} • {req.roll_number || req.department_id || 'Global'}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-transparent ${
                      req.leave_type === 'CL' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                      req.leave_type === 'ML' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {req.leave_type} <span className="text-gray-400 font-medium ml-1">({req.days_count}D)</span>
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-gray-500 font-bold text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-800">{formatDate(req.from_date)}</span>
                      <span className="text-[10px] text-gray-400 italic">to {formatDate(req.to_date)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-gray-400 text-xs italic max-w-[200px] truncate" title={req.reason}>
                    {req.reason}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    {req.attachment_url ? (
                      <a href={req.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest" title="View Document">
                        <FileText size={14} className="mr-2" /> View Audit
                      </a>
                    ) : (
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Document</span>
                    )}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right space-x-3">
                    <button
                      onClick={() => openModal(req, 'reject')}
                      className="inline-flex items-center justify-center h-10 w-10 text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-all active:scale-95 shadow-sm"
                      title="Terminate Request"
                    >
                      <XCircle size={18} />
                    </button>
                    <button
                      onClick={() => openModal(req, 'positive')}
                      className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 group/btn"
                    >
                      {getPositiveActionType(req) === 'forward' ? (
                        <>Forward <ChevronRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" /></>
                      ) : (
                        <>Authorize <CheckCircle2 size={14} className="ml-2" /></>
                      )}
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
        customActionLabel={getPositiveActionLabel(modalAction)}
        loading={loadingAction}
        onSubmit={handleAction}
      />
    </>
  );
};

export default LeaveApprovalTable;
