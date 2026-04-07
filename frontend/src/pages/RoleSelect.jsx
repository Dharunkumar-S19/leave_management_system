import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  UserCheck,
  BookOpen,
  Crown,
  Shield,
  ArrowRight,
  CalendarDays,
} from 'lucide-react';

const roles = [
  {
    id: 'student',
    label: 'Student',
    description: 'Apply for leave, track approvals, view balance',
    icon: <GraduationCap size={32} />,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    hover: 'hover:border-blue-400 hover:bg-blue-50/80',
    iconBg: 'bg-blue-500',
    textColor: 'text-blue-600',
    shadowColor: 'hover:shadow-blue-100',
  },
  {
    id: 'staff',
    label: 'Staff',
    description: 'Review student requests, manage your own leaves',
    icon: <UserCheck size={32} />,
    gradient: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    hover: 'hover:border-purple-400 hover:bg-purple-50/80',
    iconBg: 'bg-purple-500',
    textColor: 'text-purple-600',
    shadowColor: 'hover:shadow-purple-100',
  },
  {
    id: 'hod',
    label: 'Head of Department',
    description: 'Approve staff & student leaves for your department',
    icon: <BookOpen size={32} />,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    hover: 'hover:border-emerald-400 hover:bg-emerald-50/80',
    iconBg: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    shadowColor: 'hover:shadow-emerald-100',
  },
  {
    id: 'principal',
    label: 'Principal',
    description: 'Final authority on staff leaves and institution reports',
    icon: <Crown size={32} />,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    hover: 'hover:border-amber-400 hover:bg-amber-50/80',
    iconBg: 'bg-amber-500',
    textColor: 'text-amber-600',
    shadowColor: 'hover:shadow-amber-100',
  },
  {
    id: 'admin',
    label: 'Administrator',
    description: 'System management, user control, and principal approvals',
    icon: <Shield size={32} />,
    gradient: 'from-rose-500 to-red-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    hover: 'hover:border-rose-400 hover:bg-rose-50/80',
    iconBg: 'bg-rose-500',
    textColor: 'text-rose-600',
    shadowColor: 'hover:shadow-rose-100',
  },
];

const RoleSelect = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleSelect = (roleId) => {
    setSelected(roleId);
    setTimeout(() => navigate(`/login/${roleId}`), 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-200 mb-6">
          <CalendarDays size={32} className="text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
          EduLeave Portal
        </h1>
        <p className="mt-3 text-lg text-gray-500 font-medium max-w-md mx-auto">
          College Leave Management System — Select your role to continue
        </p>
        <div className="mt-4 h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto"></div>
      </div>

      {/* Role cards grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {roles.map((role, idx) => (
          <button
            key={role.id}
            onClick={() => handleSelect(role.id)}
            className={`
              group relative flex flex-col items-start text-left p-7 rounded-3xl border-2 bg-white
              transition-all duration-300 cursor-pointer
              ${role.border} ${role.hover} ${role.shadowColor}
              hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]
              ${selected === role.id ? 'scale-95 opacity-70' : ''}
              ${idx === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}
            `}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Icon */}
            <div className={`p-3.5 rounded-2xl text-white mb-5 shadow-lg ${role.iconBg} bg-gradient-to-br ${role.gradient}`}>
              {role.icon}
            </div>

            {/* Text */}
            <div className="flex-1">
              <h2 className={`text-xl font-black text-gray-900 mb-1.5`}>{role.label}</h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">{role.description}</p>
            </div>

            {/* Arrow */}
            <div className={`mt-5 flex items-center gap-2 text-sm font-black ${role.textColor} transition-all group-hover:gap-3`}>
              Sign In
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </div>

            {/* Corner glow on hover */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${role.gradient} pointer-events-none`}></div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-gray-400 font-medium">
        © 2024 EduLeave — Secure College Leave Management System
      </p>
    </div>
  );
};

export default RoleSelect;
