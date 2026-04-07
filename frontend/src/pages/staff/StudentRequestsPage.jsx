import React, { useState, useEffect } from 'react';
import staffService from '../../services/staffService';
import StudentLeaveReviewTable from '../../components/StudentLeaveReviewTable';
import { Users, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await staffService.getPendingReviews();
      setRequests(data.pendingRequests);
    } catch (err) {
      toast.error('Failed to load pending student requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 font-black text-gray-500">
      <Loader2 className="animate-spin text-purple-600" size={40} />
      <span>Fetching Applications...</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
          <Users size={28} className="mr-3 text-purple-600" />
          Student Review Center
        </h2>
        <p className="text-gray-500 font-bold mt-1 text-sm italic">
          Review and forward leave applications from your assigned students.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-purple-50/20">
          <h3 className="text-lg font-black text-gray-800 tracking-tight">
            Pending Recommendations
          </h3>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            {requests.length} Actions Required
          </span>
        </div>
        <StudentLeaveReviewTable requests={requests} onActionComplete={fetchRequests} />
      </div>
    </div>
  );
};

export default StudentRequestsPage;
