import React, { useState } from 'react';
import { Trash2, AlertCircle, CheckCircle2, XCircle, Info, ExternalLink } from 'lucide-react';
import LeaveStatusTracker from './LeaveStatusTracker';
import LeaveDetailModal from './LeaveDetailModal';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    forwarded: 'bg-blue-100 text-blue-700 border-blue-200',
    na: 'bg-gray-100 text-gray-500 border-gray-200'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${styles[status] || styles.pending} uppercase tracking-widest`}>
      {status}
    </span>
  );
};

const MultiLevelStatus = ({ leave, role }) => {
  if (role === 'student') {
    return <LeaveStatusTracker level1Status={leave.level1_status} level2Status={leave.level2_status} />;
  }

  const levels = [];
  if (role === 'staff') {
    levels.push({ label: 'HOD', status: leave.level1_status });
    levels.push({ label: 'Principal', status: leave.level2_status });
  } else if (role === 'hod') {
    levels.push({ label: 'Principal', status: leave.level1_status });
  }

  return (
    <div className="flex flex-col space-y-2">
      {levels.map((lvl, i) => (
        <div key={i} className="flex items-center space-x-2 text-[10px]">
          <span className="font-bold text-gray-400 min-w-[50px]">{lvl.label}:</span>
          <StatusBadge status={lvl.status} />
        </div>
      ))}
    </div>
  );
};

const MyLeaveTable = ({ leaves, role, onCancel }) => {
  const [detailLeaveId, setDetailLeaveId] = useState(null);

  if (leaves.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-center mb-4 text-gray-300">
          <Info size={48} />
        </div>
        <h3 className="text-lg font-bold text-gray-600">No leave requests found.</h3>
        <p className="text-gray-400 mt-1">Start by applying for your first leave!</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-wider font-bold text-gray-500">
            <tr>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-left">Dates</th>
              <th className="px-6 py-4 text-left">Days</th>
              <th className="px-6 py-4 text-left">Reason</th>
              <th className="px-6 py-4 text-left">Overall Status</th>
              <th className="px-6 py-4 text-left">Tracking</th>
              <th className="px-6 py-4 text-left">Applied On</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {leaves.map((leave) => (
              <tr 
                key={leave.id} 
                onClick={() => setDetailLeaveId(leave.id)}
                className="hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`font-bold ${leave.leave_type === 'CL' ? 'text-blue-600' : leave.leave_type === 'ML' ? 'text-red-600' : 'text-green-600'}`}>
                    {leave.leave_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  <div className="font-semibold">{formatDate(leave.from_date)}</div>
                  <div className="text-xs text-gray-400">to {formatDate(leave.to_date)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">
                  {leave.days_count}
                </td>
                <td className="px-6 py-4 max-w-xs truncate text-gray-500" title={leave.reason}>
                  {leave.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={leave.overall_status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <MultiLevelStatus leave={leave} role={role} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                  <span className="flex items-center">
                     {formatDate(leave.created_at)}
                     <ExternalLink size={12} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {(leave.overall_status === 'pending' && leave.level1_status === 'pending') ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onCancel(leave.id); }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors group/btn"
                      title="Cancel Request"
                    >
                      <Trash2 size={18} className="group-active/btn:scale-95" />
                    </button>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LeaveDetailModal 
        isOpen={!!detailLeaveId} 
        leaveId={detailLeaveId} 
        onClose={() => setDetailLeaveId(null)} 
      />
    </div>
  );
};

export default MyLeaveTable;
