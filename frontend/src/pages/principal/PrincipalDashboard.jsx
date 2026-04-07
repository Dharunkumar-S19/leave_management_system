import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import leaveService from '../../services/leaveService';
import principalService from '../../services/principalService';
import LeaveBalanceCards from '../../components/LeaveBalanceCards';
import MyLeaveTable from '../../components/MyLeaveTable';
import LeaveApprovalTable from '../../components/LeaveApprovalTable';
import ApplyLeaveModal from '../../components/ApplyLeaveModal';
import { Plus, Users, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'hod'
  const [myLeaves, setMyLeaves] = useState([]);
  const [staffRequests, setStaffRequests] = useState([]);
  const [hodRequests, setHodRequests] = useState([]);
  const [balance, setBalance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [leaveData, balanceData, reqStaff, reqHod] = await Promise.all([
        leaveService.getMyLeaves(),
        leaveService.getLeaveBalance(),
        principalService.getPendingStaffReviews(),
        principalService.getPendingHodReviews()
      ]);
      setMyLeaves(leaveData.leaves);
      setBalance(balanceData.balance);
      setStaffRequests(reqStaff.pendingRequests);
      setHodRequests(reqHod.pendingRequests);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id, remarks) => {
    try {
      await leaveService.approveLeave(id, remarks);
      toast.success('Successfully Approved');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id, remarks) => {
    try {
      await leaveService.rejectLeave(id, remarks);
      toast.success('Request Rejected');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-500 font-bold animate-pulse">Loading Institutional Data...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome, {user?.name}
          </h2>
          <p className="text-slate-500 font-bold mt-1 text-sm">
            Institutional overview and final approvals.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black shadow-xl shadow-slate-200 transition-all active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Apply for personal leave</span>
        </button>
      </div>

      {/* Own Balances */}
      <LeaveBalanceCards balance={balance} />

      {/* Review Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex space-x-8 px-8">
            <button
              className={`py-6 text-sm font-black uppercase tracking-widest border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'staff' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
              onClick={() => setActiveTab('staff')}
            >
              <Users size={16} />
              <span>Staff Requests ({staffRequests.length})</span>
            </button>
            <button
              className={`py-6 text-sm font-black uppercase tracking-widest border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'hod' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
              onClick={() => setActiveTab('hod')}
            >
              <UserCheck size={16} />
              <span>HOD Requests ({hodRequests.length})</span>
            </button>
          </div>
        </div>

        <div className="p-8 bg-white">
          {activeTab === 'staff' ? (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-500 text-sm mb-4">Pending Final Approval (Forwarded by HODs)</h4>
              <LeaveApprovalTable 
                requests={staffRequests} 
                reviewerRole="principal" 
                onApprove={handleApprove} 
                onReject={handleReject} 
              />
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-500 text-sm mb-4">Pending Approval (Direct from HODs)</h4>
              <LeaveApprovalTable 
                requests={hodRequests} 
                reviewerRole="principal" 
                onApprove={handleApprove} 
                onReject={handleReject} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Principal's Own Leaves History */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">My Leave History</h3>
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-md">Auto-Approved</span>
        </div>
        <MyLeaveTable leaves={myLeaves} role="principal" onCancel={() => {}} />
      </div>

      <ApplyLeaveModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        balance={balance} 
        onFinish={fetchData} 
      />
    </div>
  );
};

export default PrincipalDashboard;
