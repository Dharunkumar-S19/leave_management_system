import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import leaveService from '../../services/leaveService';
import hodService from '../../services/hodService';
import LeaveBalanceCards from '../../components/LeaveBalanceCards';
import MyLeaveTable from '../../components/MyLeaveTable';
import LeaveApprovalTable from '../../components/LeaveApprovalTable';
import ApplyLeaveModal from '../../components/ApplyLeaveModal';
import { Plus, Users, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const HodDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'staff'
  const [myLeaves, setMyLeaves] = useState([]);
  const [studentRequests, setStudentRequests] = useState([]);
  const [staffRequests, setStaffRequests] = useState([]);
  const [balance, setBalance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [leaveData, balanceData, reqStudent, reqStaff] = await Promise.all([
        leaveService.getMyLeaves(),
        leaveService.getLeaveBalance(),
        hodService.getPendingStudentReviews(),
        hodService.getPendingStaffReviews()
      ]);
      setMyLeaves(leaveData.leaves);
      setBalance(balanceData.balance);
      setStudentRequests(reqStudent.pendingRequests);
      setStaffRequests(reqStaff.pendingRequests);
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
      toast.success('Successfully Processed');
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      <p className="text-gray-500 font-bold animate-pulse">Loading Department Data...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Welcome, {user?.name.split(' ')[0]}
          </h2>
          <p className="text-gray-500 font-bold mt-1 text-sm">
            Department overview and request management.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 transition-all active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Apply for personal leave</span>
        </button>
      </div>

      {/* Staff's Own Balances */}
      <LeaveBalanceCards balance={balance} />

      {/* Review Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex space-x-8 px-8">
            <button
              className={`py-6 text-sm font-black uppercase tracking-widest border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'student' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
              onClick={() => setActiveTab('student')}
            >
              <Users size={16} />
              <span>Student Leaves ({studentRequests.length})</span>
            </button>
            <button
              className={`py-6 text-sm font-black uppercase tracking-widest border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'staff' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
              onClick={() => setActiveTab('staff')}
            >
              <UserCheck size={16} />
              <span>Staff Leaves ({staffRequests.length})</span>
            </button>
          </div>
        </div>

        <div className="p-8 bg-gray-50/30">
          {activeTab === 'student' ? (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-500 text-sm mb-4">Pending Final Approval</h4>
              <LeaveApprovalTable 
                requests={studentRequests} 
                reviewerRole="hod" 
                onApprove={handleApprove} 
                onReject={handleReject} 
              />
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-500 text-sm mb-4">Pending Forward to Principal</h4>
              <LeaveApprovalTable 
                requests={staffRequests} 
                reviewerRole="hod" 
                onApprove={handleApprove} 
                onReject={handleReject} 
              />
            </div>
          )}
        </div>
      </div>

      {/* HOD's Own Leaves History */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">My Leave History</h3>
        <MyLeaveTable leaves={myLeaves} role="hod" onCancel={() => {}} />
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

export default HodDashboard;
