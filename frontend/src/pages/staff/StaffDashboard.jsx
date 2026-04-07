import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import leaveService from '../../services/leaveService';
import staffService from '../../services/staffService';
import LeaveBalanceCards from '../../components/LeaveBalanceCards';
import MyLeaveTable from '../../components/MyLeaveTable';
import StudentLeaveReviewTable from '../../components/StudentLeaveReviewTable';
import ApplyLeaveModal from '../../components/ApplyLeaveModal';
import { Plus, Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [myLeaves, setMyLeaves] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [balance, setBalance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [leaveData, balanceData, reviewData] = await Promise.all([
        leaveService.getMyLeaves(),
        leaveService.getLeaveBalance(),
        staffService.getPendingReviews()
      ]);
      setMyLeaves(leaveData.leaves);
      setBalance(balanceData.balance);
      setPendingReviews(reviewData.pendingRequests);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelLeave = async (id) => {
    if (window.confirm('Cancel this leave request?')) {
      try {
        await leaveService.cancelLeave(id);
        toast.success('Cancelled');
        fetchData(); // refresh all
      } catch (err) {
        toast.error('Failed to cancel');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      <p className="text-gray-500 font-bold animate-pulse">Synchronizing Staff Portal...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Dashboard overview
          </h2>
          <p className="text-gray-500 font-bold mt-1 text-sm">
            Manage your leaves and review student requests.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black shadow-xl shadow-purple-100 transition-all active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Review Alert Badge */}
      {pendingReviews.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-sm animate-in slide-in-from-bottom-2">
          <div className="flex items-center space-x-3 text-amber-700 font-bold">
            <Users size={20} className="text-amber-500" />
            <span>You have {pendingReviews.length} student request{pendingReviews.length > 1 ? 's' : ''} pending your review.</span>
          </div>
          <button className="text-amber-600 hover:text-amber-800 text-sm font-black uppercase tracking-widest flex items-center transition-colors">
            Review Now <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
      )}

      {/* Staff's Own Balances */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">My Leave Balance</h3>
        <LeaveBalanceCards balance={balance} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Pending Student Requests Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
              <Users size={20} className="mr-2 text-purple-600" />
              Student Requests
            </h3>
          </div>
          <StudentLeaveReviewTable requests={pendingReviews} onActionComplete={fetchData} />
        </div>

        {/* Staff's Own Leaves History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
              <Clock size={20} className="mr-2 text-purple-600" />
              My History
            </h3>
          </div>
          <MyLeaveTable leaves={myLeaves} role="staff" onCancel={handleCancelLeave} />
        </div>
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

export default StaffDashboard;
