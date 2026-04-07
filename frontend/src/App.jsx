import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import LeaveBalanceCards from './components/LeaveBalanceCards';
import MyLeaveTable from './components/MyLeaveTable';
import ApplyLeaveModal from './components/ApplyLeaveModal';
import leaveService from './services/leaveService';
import { LogOut, Plus, LayoutDashboard, User } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

// Shared Dashboard Component for all roles
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [leaveData, balanceData] = await Promise.all([
        leaveService.getMyLeaves(),
        leaveService.getLeaveBalance()
      ]);
      setLeaves(leaveData.leaves);
      setBalance(balanceData.balance);
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelLeave = async (id) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      try {
        await leaveService.cancelLeave(id);
        toast.success('Request cancelled');
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cancel');
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen font-bold text-blue-600">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Simple Navigation */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 space-y-8">
        <div className="flex items-center space-x-3 text-blue-600">
          <LayoutDashboard size={28} />
          <span className="font-extrabold text-xl tracking-tight text-gray-900">EduLeave</span>
        </div>

        <nav className="flex-1 space-y-1">
          <button className="flex items-center space-x-3 w-full p-3 bg-blue-50 text-blue-700 rounded-xl font-bold transition-all">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          {/* Future sections like Review, Reports can go here */}
        </nav>

        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-6 p-2">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">
              {user?.name[0]}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[10px] uppercase font-extrabold text-blue-600">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center space-x-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Main Dashboard</h1>
              <p className="text-gray-500 font-medium">Welcome back, {user?.name.split(' ')[0]}!</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              <Plus size={20} />
              <span>Apply Leave</span>
            </button>
          </div>

          <LeaveBalanceCards balance={balance} />
          
          <div className="mt-12">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center space-x-2">
              <User size={20} className="text-blue-600" />
              <span>My Leave History</span>
            </h2>
            <MyLeaveTable leaves={leaves} role={user?.role} onCancel={handleCancelLeave} />
          </div>
        </div>
      </main>

      <ApplyLeaveModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        balance={balance} 
        onFinish={fetchData} 
      />
    </div>
  );
};

import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StaffLayout from './pages/staff/StaffLayout';
import StaffDashboard from './pages/staff/StaffDashboard';

import HodLayout from './pages/hod/HodLayout';
import HodDashboard from './pages/hod/HodDashboard';

import PrincipalLayout from './pages/principal/PrincipalLayout';
import PrincipalDashboard from './pages/principal/PrincipalDashboard';
import LeaveReport from './pages/principal/LeaveReport';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import RoleSelect from './pages/RoleSelect';
import Profile from './pages/shared/Profile';
import MyLeavesPage from './pages/shared/MyLeavesPage';
import HodLeaveReport from './pages/hod/HodLeaveReport';
import StudentRequestsPage from './pages/staff/StudentRequestsPage';
import PrincipalRequestsPage from './pages/admin/PrincipalRequestsPage';
import AllLeavesPage from './pages/admin/AllLeavesPage';
import UserManagementPage from './pages/admin/UserManagementPage';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Role Selection Landing Page */}
          <Route path="/" element={<RoleSelect />} />

          {/* Role-Specific Login */}
          <Route path="/login/:role" element={<Login />} />

          {/* Legacy /login fallback → role select */}
          <Route path="/login" element={<RoleSelect />} />
          
          {/* Student Specific Route with Nested Layout */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="my-leaves" element={<MyLeavesPage />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </StudentLayout>
            </ProtectedRoute>
          } />

          {/* Staff Specific Route with Nested Layout */}
          <Route path="/staff/*" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffLayout>
                <Routes>
                  <Route path="dashboard" element={<StaffDashboard />} />
                  <Route path="student-requests" element={<StudentRequestsPage />} />
                  <Route path="my-leaves" element={<MyLeavesPage />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </StaffLayout>
            </ProtectedRoute>
          } />

          {/* HOD Specific Route with Nested Layout */}
          <Route path="/hod/*" element={
            <ProtectedRoute allowedRoles={['hod']}>
              <HodLayout>
                <Routes>
                  <Route path="dashboard" element={<HodDashboard />} />
                  <Route path="report" element={<HodLeaveReport />} />
                  <Route path="my-leaves" element={<MyLeavesPage />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </HodLayout>
            </ProtectedRoute>
          } />

          {/* Principal Specific Route with Nested Layout */}
          <Route path="/principal/*" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <PrincipalLayout>
                <Routes>
                  <Route path="dashboard" element={<PrincipalDashboard />} />
                  <Route path="report" element={<LeaveReport />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </PrincipalLayout>
            </ProtectedRoute>
          } />

          {/* Admin Specific Route with Nested Layout */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="principal-requests" element={<PrincipalRequestsPage />} />
                  <Route path="all-leaves" element={<AllLeavesPage />} />
                  <Route path="users" element={<UserManagementPage />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Catch All Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
