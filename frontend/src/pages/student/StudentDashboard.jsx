import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import leaveService from '../../services/leaveService';
import LeaveBalanceCards from '../../components/LeaveBalanceCards';
import MyLeaveTable from '../../components/MyLeaveTable';
import ApplyLeaveModal from './../../components/ApplyLeaveModal';
import { Plus, Calendar, Clock, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [leaveData, balanceData, upcomingData] = await Promise.all([
        leaveService.getMyLeaves(),
        leaveService.getLeaveBalance(),
        leaveService.getUpcomingLeaves()
      ]);
      setLeaves(leaveData.leaves);
      setBalance(balanceData.balance);
      setUpcomingLeaves(upcomingData.leaves);
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
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cancel');
      }
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-500 font-bold animate-pulse">Synchronizing Data...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {getGreeting()}, <span className="text-blue-600">{user?.name.split(' ')[0]}!</span>
          </h2>
          <p className="text-gray-500 font-bold mt-1 flex items-center">
            <Calendar size={16} className="mr-2 text-gray-400" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-100 transition-all active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Stats Section */}
      <LeaveBalanceCards balance={balance} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main history - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
              <Clock size={20} className="mr-2 text-blue-600" />
              My Leave Requests
            </h3>
            
            {/* Filter Pills */}
            <div className="flex items-center p-1 bg-gray-100 rounded-2xl w-fit">
              {['ALL', 'CL', 'ML', 'OD'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterType === type 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <MyLeaveTable 
            leaves={filterType === 'ALL' ? leaves : leaves.filter(l => l.leave_type === filterType)} 
            role="student" 
            onCancel={handleCancelLeave} 
          />
        </div>

        {/* Upcoming Leaves - 1/3 width */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
            <Calendar size={20} className="mr-2 text-blue-600" />
            Upcoming Leaves
          </h3>
          <div className="space-y-4">
            {upcomingLeaves.length === 0 ? (
              <div className="p-8 bg-white border border-gray-100 rounded-3xl text-center shadow-sm">
                <p className="text-gray-400 font-bold">No upcoming leaves.</p>
              </div>
            ) : (
              upcomingLeaves.map((leave) => (
                <div key={leave.id} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all border-l-4 border-l-green-500">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 px-2 py-1 bg-blue-50 rounded-lg">
                      {leave.leave_type}
                    </span>
                    <span className="text-xs font-black text-gray-400">{leave.days_count} Days</span>
                  </div>
                  <p className="font-black text-gray-800">
                    {new Date(leave.from_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(leave.to_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-medium italic">Approved</p>
                </div>
              ))
            )}
          </div>

          {/* Quick Info Card */}
          <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl text-white shadow-xl shadow-blue-100">
            <h4 className="font-black text-lg mb-2">Quick Tip</h4>
            <p className="text-sm opacity-90 font-medium leading-relaxed">
              Medical leaves (ML) require a supporting document to be uploaded for approval.
            </p>
            <div className="mt-4 flex items-center text-xs font-black uppercase tracking-widest opacity-80">
              Read Policy <ChevronRight size={14} className="ml-1" />
            </div>
          </div>
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

export default StudentDashboard;
