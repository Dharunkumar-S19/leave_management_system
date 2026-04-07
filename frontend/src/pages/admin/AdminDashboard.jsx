import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  ClipboardList, Users, CheckCircle2, XCircle,
  UserCheck, UserX, Clock, AlertTriangle, ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import adminService from '../../services/adminService';
import RemarksModal from '../../components/RemarksModal';

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white border border-gray-100 rounded-[32px] p-8 flex items-center space-x-6 shadow-sm hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{label}</p>
    </div>
  </div>
);

// ── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:  'bg-amber-50 text-amber-600 border-amber-100',
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-rose-50 text-rose-600 border-rose-100',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black border capitalize ${map[status] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
      {status}
    </span>
  );
};

// ── Principal Requests Tab ─────────────────────────────────────────────────
const PrincipalRequestsTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, action: null, id: null, name: '' });

  const fetchRequests = async () => {
    try {
      const { data } = await adminService.getPrincipalRequests();
      setRequests(data.requests);
    } catch {
      toast.error('Failed to load principal requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = (id, action, name) => setModal({ open: true, action, id, name });

  const handleConfirm = async (remarks) => {
    try {
      if (modal.action === 'approve') {
        await adminService.approveLeave(modal.id, remarks);
        toast.success('Leave approved!');
      } else {
        await adminService.rejectLeave(modal.id, remarks);
        toast.error('Leave rejected.');
      }
      setModal({ open: false, action: null, id: null, name: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed.');
    }
  };

  if (loading) return (
    <div className="text-indigo-600 text-center py-20 flex flex-col items-center gap-4">
      <Loader2 className="animate-spin" size={32} />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Synchronizing Domain Nodes...</span>
    </div>
  );

  const pending = requests.filter(r => r.level1_status === 'pending');
  const actioned = requests.filter(r => r.level1_status !== 'pending');

  return (
    <div className="space-y-8">
      {/* Pending */}
      <div>
        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
          <Clock size={20} className="text-amber-500" /> Pending Approvals ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-[40px] border border-gray-100 shadow-sm">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500 opacity-20" />
            <p className="font-black italic">No pending principal leave requests found in system queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[32px] border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50">
                <tr className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                  <th className="px-8 py-4 text-left">Principal Identity</th>
                  <th className="px-8 py-4 text-left">Leave Matrix</th>
                  <th className="px-8 py-4 text-left">Temporal Start</th>
                  <th className="px-8 py-4 text-left">Temporal End</th>
                  <th className="px-8 py-4 text-left">Node Days</th>
                  <th className="px-8 py-4 text-left">Primary Reason</th>
                  <th className="px-8 py-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pending.map(req => (
                  <tr key={req.id} className="hover:bg-indigo-50/10 transition-colors group">
                    <td className="px-8 py-6 font-black text-gray-900 tracking-tight">{req.applicant_name}</td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100 uppercase tracking-widest">{req.leave_type}</span>
                    </td>
                    <td className="px-8 py-6 text-gray-500 font-bold">{new Date(req.from_date).toLocaleDateString('en-GB')}</td>
                    <td className="px-8 py-6 text-gray-500 font-bold">{new Date(req.to_date).toLocaleDateString('en-GB')}</td>
                    <td className="px-8 py-6 text-indigo-600 font-black">{req.days_count} Units</td>
                    <td className="px-8 py-6 text-gray-400 text-xs italic truncate max-w-[200px]">{req.reason}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleAction(req.id, 'approve', req.applicant_name)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-emerald-100 active:scale-95 uppercase tracking-widest"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'reject', req.applicant_name)}
                          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-rose-100 active:scale-95 uppercase tracking-widest"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actioned */}
      {actioned.length > 0 && (
        <div className="pt-6">
          <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">Recently Actioned History</h3>
          <div className="overflow-x-auto rounded-[32px] border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50">
                <tr className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                  <th className="px-8 py-4 text-left">Principal Node</th>
                  <th className="px-8 py-4 text-left">Matrix</th>
                  <th className="px-8 py-4 text-left">Duration</th>
                  <th className="px-8 py-4 text-left">Node Status</th>
                  <th className="px-8 py-4 text-left">Audit Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {actioned.slice(0, 10).map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 text-gray-600 font-black">{req.applicant_name}</td>
                    <td className="px-8 py-5 text-gray-500 font-bold uppercase text-[10px]">{req.leave_type}</td>
                    <td className="px-8 py-5 text-indigo-600 font-black">{req.days_count}U</td>
                    <td className="px-8 py-5"><StatusBadge status={req.overall_status} /></td>
                    <td className="px-8 py-5 text-gray-400 text-[10px] font-bold italic">{req.level1_remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RemarksModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, action: null, id: null, name: '' })}
        onConfirm={handleConfirm}
        action={modal.action}
        applicantName={modal.name}
      />
    </div>
  );
};

// ── User Management Tab ───────────────────────────────────────────────────
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      const { data } = await adminService.getAllUsers();
      setUsers(data.users);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (id, name, currentStatus) => {
    try {
      await adminService.toggleUserStatus(id);
      toast.success(`${name} ${currentStatus ? 'deactivated' : 'activated'} successfully.`);
      fetchUsers();
    } catch {
      toast.error('Failed to update user status.');
    }
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);
  const roleBadge = (role) => {
    const map = { 
      student: 'bg-blue-50 text-blue-600 border-blue-100', 
      staff: 'bg-purple-50 text-purple-600 border-purple-100', 
      hod: 'bg-emerald-50 text-emerald-600 border-emerald-100', 
      principal: 'bg-amber-50 text-amber-600 border-amber-100', 
      admin: 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-100' 
    };
    return <span className={`px-3 py-1 rounded-lg text-[10px] font-black capitalize border uppercase tracking-widest ${map[role] || 'bg-gray-50 text-gray-400 border-gray-200'}`}>{role}</span>;
  };

  if (loading) return <div className="text-indigo-600 text-center py-20 flex flex-col items-center gap-3">
    <Loader2 className="animate-spin" size={32} />
    <span className="font-bold text-sm tracking-widest uppercase">Initializing Node Registry...</span>
  </div>;

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {['all', 'student', 'staff', 'hod', 'principal'].map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black capitalize transition-all uppercase tracking-widest ${filter === r ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 active:scale-95' : 'bg-white text-gray-400 border border-gray-100 hover:border-indigo-400 hover:text-indigo-600 shadow-sm'}`}
          >
            {r === 'all' ? `All Nodes (${users.length})` : `${r} (${users.filter(u => u.role === r).length})`}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[32px] border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50">
            <tr className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
              <th className="px-8 py-4 text-left">User Identity</th>
              <th className="px-8 py-4 text-left">Access Mail</th>
              <th className="px-8 py-4 text-left">Institutional Role</th>
              <th className="px-8 py-4 text-left">Assigned Dept</th>
              <th className="px-8 py-4 text-left">Node Status</th>
              <th className="px-8 py-4 text-right">System Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-indigo-50/10 transition-colors group">
                <td className="px-8 py-5 font-black text-gray-900 tracking-tight">{u.name}</td>
                <td className="px-8 py-5 text-gray-500 font-bold">{u.email}</td>
                <td className="px-8 py-5">{roleBadge(u.role)}</td>
                <td className="px-8 py-5 text-gray-400 font-bold">{u.department_name || 'Global'}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${u.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    {u.is_active ? 'Active' : 'Halted'}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggle(u.id, u.name, u.is_active)}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest shadow-sm active:scale-95 ${u.is_active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}
                    >
                      {u.is_active ? <><UserX size={14} /> Deactivate</> : <><UserCheck size={14} /> Activate</>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, users: 0 });
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [leavesRes, usersRes] = await Promise.all([
          adminService.getPrincipalRequests(),
          adminService.getAllUsers(),
        ]);
        const leaves = leavesRes.data.requests;
        setStats({
          pending: leaves.filter(l => l.level1_status === 'pending').length,
          approved: leaves.filter(l => l.overall_status === 'approved').length,
          rejected: leaves.filter(l => l.overall_status === 'rejected').length,
          users: usersRes.data.users.length,
        });
      } catch {}
    };
    fetchStats();
  }, []);

  const tabs = [
    { id: 'requests', label: 'Principal Leave Requests' },
    { id: 'users', label: 'User Management' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100">
          <Shield size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase">System Overview</h1>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mt-1">Institutional Node Central Command</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Pending Decisions" value={stats.pending} icon={<Clock size={24} className="text-amber-600" />} color="bg-amber-50" />
        <StatCard label="Resolved Approvals" value={stats.approved} icon={<CheckCircle2 size={24} className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard label="Terminal Rejections" value={stats.rejected} icon={<XCircle size={24} className="text-rose-600" />} color="bg-rose-50" />
        <StatCard label="Active Identitites" value={stats.users} icon={<Users size={24} className="text-indigo-600" />} color="bg-indigo-50" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all border-b-4 -mb-[2px] ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {tab.id === 'requests' && stats.pending > 0 && (
                <span className="ml-3 px-2 py-0.5 bg-indigo-600 text-white text-[8px] rounded-full">{stats.pending}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'requests' && <PrincipalRequestsTab />}
      {activeTab === 'users' && <UsersTab />}
    </div>
  );
};

export default AdminDashboard;
