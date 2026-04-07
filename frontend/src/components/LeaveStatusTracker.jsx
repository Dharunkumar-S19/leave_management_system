import React from 'react';
import { CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react';

const LeaveStatusTracker = ({ level1Status, level2Status }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
      case 'forwarded':
        return { color: 'text-green-500', icon: <CheckCircle2 size={16} />, label: status === 'forwarded' ? 'Forwarded' : 'Approved' };
      case 'rejected':
        return { color: 'text-red-500', icon: <XCircle size={16} />, label: 'Rejected' };
      case 'pending':
        return { color: 'text-amber-500', icon: <Clock size={16} />, label: 'Pending' };
      default:
        return { color: 'text-gray-300', icon: <Clock size={16} />, label: 'Waiting' };
    }
  };

  const step1 = getStatusInfo(level1Status);
  const step2 = getStatusInfo(level1Status === 'forwarded' ? level2Status : 'na');

  return (
    <div className="flex items-center space-x-2 py-1">
      {/* Step 1: Staff */}
      <div className="flex flex-col items-center">
        <div className={`p-1.5 rounded-full bg-white border-2 ${step1.color.replace('text', 'border')} shadow-sm`}>
          {step1.icon}
        </div>
        <span className="text-[9px] font-bold mt-1 uppercase text-gray-400">Staff</span>
      </div>

      <div className={`h-0.5 w-6 ${level1Status === 'forwarded' ? 'bg-green-500' : 'bg-gray-200'}`}></div>

      {/* Step 2: HOD */}
      <div className="flex flex-col items-center">
        <div className={`p-1.5 rounded-full bg-white border-2 ${level1Status === 'forwarded' ? step2.color.replace('text', 'border') : 'border-gray-100'} shadow-sm`}>
          {step2.icon}
        </div>
        <span className="text-[9px] font-bold mt-1 uppercase text-gray-400">HOD</span>
      </div>
    </div>
  );
};

export default LeaveStatusTracker;
