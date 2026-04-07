import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2,
  X,
  Check,
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department_id: '',
    class: '',
    roll_number: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers();
      setUsers(response.data.users);
    } catch (err) {
      toast.error('Failed to load user database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      await adminService.toggleUserStatus(user.id);
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to permanently remove this user? This action cannot be undone.')) {
      try {
        await adminService.deleteUser(id);
        toast.success('User removed from system');
        fetchUsers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id, formData);
        toast.success('User details updated successfully');
      } else {
        await adminService.createUser(formData);
        toast.success('New user account provisioned successfully');
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'student', department_id: '', class: '', roll_number: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show password
      role: user.role,
      department_id: user.department_id || '',
      class: user.class || '',
      roll_number: user.roll_number || ''
    });
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center uppercase tracking-tighter">
            <Users size={28} className="mr-3 text-indigo-600" />
            User Management System
          </h2>
          <p className="text-gray-500 font-bold mt-1 text-sm italic">
            Centralized control of institutional hierarchy and user access nodes.
          </p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="flex items-center justify-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 group"
        >
          <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
          <span>Provision New Account</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Accounts', val: users.length, icon: <Users size={16} />, color: 'bg-gray-100 text-gray-600' },
          { label: 'Active Nodes', val: users.filter(u => u.is_active).length, icon: <Check size={16} />, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Admin Access', val: users.filter(u => u.role === 'admin').length, icon: <ShieldCheck size={16} />, color: 'bg-indigo-100 text-indigo-600' },
          { label: 'Students', val: users.filter(u => u.role === 'student').length, icon: <Users size={16} />, color: 'bg-blue-100 text-blue-600' },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-3xl border border-gray-50 flex items-center space-x-4 bg-white shadow-sm`}>
            <div className={`p-3 rounded-2xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">{s.label}</p>
              <p className="text-xl font-black text-gray-900">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or role..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-sm"
            />
          </div>
          <div className="flex space-x-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
               Direct Database Sync: <span className="text-green-500 ml-1">Connected</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-widest text-gray-400">
              <tr>
                <th className="px-8 py-6 text-left">Internal Identity</th>
                <th className="px-8 py-6 text-left">Institutional Role</th>
                <th className="px-8 py-6 text-left">Department / Unit</th>
                <th className="px-8 py-6 text-left">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-24"><Loader2 className="animate-spin text-indigo-600 mx-auto" /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-24 font-black text-gray-300 italic">No matching identities found</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-indigo-50/10 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black uppercase text-sm border border-indigo-100 group-hover:scale-110 transition-transform">
                          {user.name[0]}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{user.name}</div>
                          <div className="text-xs font-bold text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100 ${
                         user.role === 'admin' ? 'bg-indigo-900 text-white shadow-lg shadow-indigo-100' :
                         user.role === 'principal' ? 'bg-blue-50 text-blue-700' :
                         'bg-gray-50 text-gray-700'
                       }`}>
                         {user.role}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-700">{user.department_name || 'Global'}</div>
                      {user.class && <div className="text-[10px] font-black text-gray-400 uppercase">{user.class}</div>}
                    </td>
                    <td className="px-8 py-5">
                      <button 
                        onClick={() => handleToggleStatus(user)}
                        className={`group flex items-center space-x-2 px-3 py-1 rounded-full border transition-all ${
                          user.is_active 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-gray-100 text-gray-400 border-gray-200'
                        }`}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full ${user.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <span className="text-[10px] font-black uppercase">{user.is_active ? 'Active' : 'Halted'}</span>
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={16}/></button>
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl p-10 relative overflow-hidden">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600"><X size={24}/></button>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight italic">{editingUser ? 'Adjust Identity Node' : 'Provision New Identity'}</h3>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Institutional Hierarchy Management</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Legal Name</label>
                   <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-400 outline-none transition-all font-bold text-sm" placeholder="e.g. John Doe"/>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">System Email Address</label>
                   <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-400 outline-none transition-all font-bold text-sm" placeholder="user@college.edu"/>
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Initial Password</label>
                    <input required type="password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-sm" placeholder="********"/>
                  </div>
                )}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Institutional Role</label>
                   <select value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-400 outline-none transition-all font-black text-sm">
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                      <option value="hod">HOD</option>
                      <option value="principal">Principal</option>
                      <option value="admin">Admin</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Department Unit</label>
                   <select value={formData.department_id} onChange={e=>setFormData({...formData, department_id: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-400 outline-none transition-all font-black text-sm">
                      <option value="">Global/None</option>
                      <option value="1">Computer Science</option>
                      <option value="2">Mechanical Engineering</option>
                      <option value="3">Electronics Communication</option>
                   </select>
                </div>
                {formData.role === 'student' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Target Class</label>
                      <input type="text" value={formData.class} onChange={e=>setFormData({...formData, class: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-400 outline-none transition-all font-bold text-sm" placeholder="e.g. III CSE A"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Roll ID</label>
                      <input type="text" value={formData.roll_number} onChange={e=>setFormData({...formData, roll_number: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-400 outline-none transition-all font-bold text-sm" placeholder="e.g. 101"/>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-6 border-t border-gray-50">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black shadow-2xl shadow-indigo-100 transition-all active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                  <span>{isSubmitting ? 'Communicating with Central Node...' : (editingUser ? 'Commit Database Changes' : 'Execute System Provisioning')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
