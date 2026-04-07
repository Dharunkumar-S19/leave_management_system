import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import {
  LogIn, Mail, Lock, GraduationCap, UserCheck,
  BookOpen, Crown, Shield, ArrowLeft,
} from 'lucide-react';

const roleConfig = {
  student: {
    label: 'Student Portal',
    description: 'Sign in to manage your leaves and track approvals',
    icon: <GraduationCap size={28} />,
    gradient: 'from-blue-600 to-cyan-500',
    color: 'blue',
    ring: 'focus:ring-blue-500 focus:border-blue-500',
    btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    shadow: 'shadow-blue-100',
    back: 'text-blue-600 hover:text-blue-700',
  },
  staff: {
    label: 'Staff Portal',
    description: 'Sign in to review student requests and apply for leave',
    icon: <UserCheck size={28} />,
    gradient: 'from-purple-600 to-violet-500',
    color: 'purple',
    ring: 'focus:ring-purple-500 focus:border-purple-500',
    btn: 'bg-purple-600 hover:bg-purple-700 shadow-purple-200',
    shadow: 'shadow-purple-100',
    back: 'text-purple-600 hover:text-purple-700',
  },
  hod: {
    label: 'HOD Portal',
    description: 'Sign in to manage department leave approvals',
    icon: <BookOpen size={28} />,
    gradient: 'from-emerald-600 to-teal-500',
    color: 'emerald',
    ring: 'focus:ring-emerald-500 focus:border-emerald-500',
    btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
    shadow: 'shadow-emerald-100',
    back: 'text-emerald-600 hover:text-emerald-700',
  },
  principal: {
    label: 'Principal Portal',
    description: 'Sign in to oversee institutional leave management',
    icon: <Crown size={28} />,
    gradient: 'from-amber-500 to-orange-500',
    color: 'amber',
    ring: 'focus:ring-amber-500 focus:border-amber-500',
    btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
    shadow: 'shadow-amber-100',
    back: 'text-amber-600 hover:text-amber-700',
  },
  admin: {
    label: 'Admin Portal',
    description: 'Sign in to manage users and system-level approvals',
    icon: <Shield size={28} />,
    gradient: 'from-rose-600 to-red-600',
    color: 'rose',
    ring: 'focus:ring-rose-500 focus:border-rose-500',
    btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
    shadow: 'shadow-rose-100',
    back: 'text-rose-600 hover:text-rose-700',
  },
};

const Login = () => {
  const { role } = useParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const config = roleConfig[role] || roleConfig.student;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(email, password);

      // Validate that the logged-in role matches the selected role
      if (data.user.role !== role) {
        toast.error(`This account is not registered as ${role}. Please select the correct role.`);
        setLoading(false);
        return;
      }

      toast.success('Login Successful!');
      navigate(`/${role}/dashboard`);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-md">
        {/* Back button */}
        <Link
          to="/"
          className={`inline-flex items-center gap-2 text-sm font-bold mb-8 ${config.back} transition-colors`}
        >
          <ArrowLeft size={16} />
          Back to Role Selection
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-100 overflow-hidden border border-gray-100">

          {/* Gradient header banner */}
          <div className={`bg-gradient-to-r ${config.gradient} px-8 py-8`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl text-white">
                {config.icon}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">{config.label}</h1>
                <p className="text-white/80 text-sm font-medium mt-0.5">{config.description}</p>
              </div>
            </div>
          </div>

          {/* Form section */}
          <div className="px-8 py-8">
            <p className="text-gray-500 text-sm font-medium mb-6">
              Enter your credentials to access your portal
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="your@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm font-medium placeholder-gray-400 outline-none transition-all ${config.ring} focus:border-2`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm font-medium placeholder-gray-400 outline-none transition-all ${config.ring} focus:border-2`}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 py-3.5 px-6 text-white font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95 ${config.btn} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Footer note */}
            <p className="text-center text-xs text-gray-400 font-medium mt-6">
              Wrong role?{' '}
              <Link to="/" className={`font-black ${config.back}`}>
                Go back and select again
              </Link>
            </p>
          </div>
        </div>

        {/* EduLeave branding */}
        <p className="text-center text-xs text-gray-400 font-medium mt-6">
          © 2024 EduLeave — College Leave Management System
        </p>
      </div>
    </div>
  );
};

export default Login;
