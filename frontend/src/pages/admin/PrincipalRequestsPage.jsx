import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import LeaveApprovalTable from '../../components/LeaveApprovalTable';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PrincipalRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getPrincipalRequests();
      setRequests(data.requests || []);
    } catch (err) {
      toast.error('Failed to load principal requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id, remarks) => {
    try {
      await adminService.approveLeave(id, remarks);
      toast.success('Request Approved Successfully');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id, remarks) => {
    try {
      await adminService.rejectLeave(id, remarks);
      toast.success('Request Rejected Successfully');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to reject');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Synchronizing High-Level Requests...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center uppercase tracking-tighter">
          <ShieldAlert size={28} className="mr-3 text-indigo-600" />
          Executive Decision Center
        </h2>
        <p className="text-gray-500 font-bold mt-1 text-sm italic">
          Final decision authority for leave applications from the Principal and senior institutional leadership.
        </p>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-indigo-50/20">
          <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">
            High-Level Authorizations
          </h3>
          <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
            {requests.length} Critical Actions Required
          </span>
        </div>
        <div className="p-2 pt-0">
          <LeaveApprovalTable 
            requests={requests} 
            onApprove={handleApprove} 
            onReject={handleReject} 
            reviewerRole="admin" 
          />
        </div>
      </div>
    </div>
  );
};

export default PrincipalRequestsPage;
