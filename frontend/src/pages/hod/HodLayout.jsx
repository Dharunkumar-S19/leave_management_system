import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  ClipboardList,
  Users,
  UserCheck,
  User, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  ChevronRight,
  FileBarChart
} from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';

const HodLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/hod/dashboard' },
    { name: 'Leave Report', icon: <FileBarChart size={20} />, path: '/hod/report' },
    { name: 'My Leaves', icon: <ClipboardList size={20} />, path: '/hod/my-leaves' },
    { name: 'Profile', icon: <User size={20} />, path: '/hod/profile' },
  ];

  useEffect(() => {
    document.title = 'HOD Portal | EduLeave';
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0 lg:w-20'}`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center space-x-3 text-emerald-600">
              <div className="p-2 bg-emerald-600 rounded-lg text-white">
                <UserCheck size={20} />
              </div>
              <span className="font-black text-xl tracking-tighter text-gray-900">EduHOD</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 mt-8 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-xl font-bold transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                    : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <div className={isActive ? 'text-white' : 'text-gray-400'}>{item.icon}</div>
                {isSidebarOpen && <span className="text-sm">{item.name}</span>}
                {isSidebarOpen && isActive && <ChevronRight size={14} className="ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100">
          <div className={`flex items-center space-x-3 p-3 mb-4 ${isSidebarOpen ? '' : 'justify-center'}`}>
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-black text-sm uppercase border-2 border-white shadow-sm shrink-0">
              {user?.name[0]}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{user?.name}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">HOD • Dept {user?.department_id}</p>
              </div>
            )}
          </div>
          <button 
            onClick={logout}
            className={`flex items-center space-x-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all ${isSidebarOpen ? '' : 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-black text-gray-800 tracking-tight">Head of Department Portal</h1>
          </div>
          <div className="flex items-center space-x-6">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="max-w-7xl mx-auto py-10 px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HodLayout;
