import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import leaveService from '../../services/leaveService';
import MyLeaveTable from '../../components/MyLeaveTable';
import LeaveBalanceCards from '../../components/LeaveBalanceCards';
import ApplyLeaveModal from '../../components/ApplyLeaveModal';
import { Clock, Plus, Filter, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MyLeavesPage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leaveData, balanceData] = await Promise.all([
        leaveService.getMyLeaves(),
        leaveService.getLeaveBalance()
      ]);
      setLeaves(leaveData.leaves);
      setBalance(balanceData.balance);
    } catch (err) {
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelLeave = async (id) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      try {
        await leaveService.cancelLeave(id);
        toast.success('Request cancelled Successfully');
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cancel');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-gray-500 font-bold">Synchronizing your leave history...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
            <Clock size={28} className="mr-3 text-blue-600" />
            My Leave Records
          </h2>
          <p className="text-gray-500 font-bold mt-1 text-sm italic">
            Full history of your leave applications and current balances.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-100 transition-all active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>New Application</span>
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Institutional Allowance</h3>
        <LeaveBalanceCards balance={balance} />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center">
            Detailed Transactions
          </h3>
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Filter size={14} />
            <span>All Statuses</span>
          </div>
        </div>
        <MyLeaveTable leaves={leaves} role={user?.role} onCancel={handleCancelLeave} />
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

export default MyLeavesPage;
