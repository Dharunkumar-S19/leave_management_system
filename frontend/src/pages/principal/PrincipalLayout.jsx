import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  UserCheck,
  Building2,
  FileBarChart,
  User, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';

const PrincipalLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/principal/dashboard' },
    { name: 'Leave Report', icon: <FileBarChart size={20} />, path: '/principal/report' },
    { name: 'Profile', icon: <User size={20} />, path: '/principal/profile' },
  ];

  useEffect(() => {
    document.title = 'Principal Portal | EduLeave';
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0 lg:w-20'}`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center space-x-3 text-white">
              <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
                <Building2 size={24} />
              </div>
              <span className="font-black text-xl tracking-tighter text-white">Institution</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
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
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</div>
                {isSidebarOpen && <span className="text-sm">{item.name}</span>}
                {isSidebarOpen && isActive && <ChevronRight size={14} className="ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className={`flex items-center space-x-3 p-3 mb-4 ${isSidebarOpen ? '' : 'justify-center'}`}>
            <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 font-black text-sm uppercase border border-slate-700 shadow-sm shrink-0">
              {user?.name[0]}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">{user?.name}</p>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{user?.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={logout}
            className={`flex items-center space-x-3 w-full p-3 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-xl font-bold transition-all ${isSidebarOpen ? '' : 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm">Secure Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Principal Dashboard</h1>
          </div>
          <div className="flex items-center space-x-6">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto py-10 px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrincipalLayout;
