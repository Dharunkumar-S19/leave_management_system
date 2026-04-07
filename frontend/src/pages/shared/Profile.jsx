import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Building, Hash, GraduationCap } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  const profileFields = [
    { label: 'Full Name', value: user.name, icon: <User size={18} /> },
    { label: 'Email Address', value: user.email, icon: <Mail size={18} /> },
    { label: 'Role', value: user.role.toUpperCase(), icon: <Shield size={18} />, highlight: true },
    { label: 'Department ID', value: user.department_id || 'N/A', icon: <Building size={18} /> },
  ];

  if (user.role === 'student') {
    profileFields.push(
      { label: 'Class', value: user.class || 'N/A', icon: <GraduationCap size={18} /> },
      { label: 'Roll Number', value: user.roll_number || 'N/A', icon: <Hash size={18} /> }
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
        {/* Header/Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="h-32 w-32 bg-white rounded-full p-2 shadow-lg">
              <div className="h-full w-full bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-4xl font-black border-4 border-white">
                {user.name[0]}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-20 pb-12 px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{user.name}</h2>
            <p className="text-gray-500 font-bold mt-1 uppercase tracking-widest text-sm flex items-center">
              <Shield size={14} className="mr-2 text-blue-600" />
              {user.role} — Account Profile
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {profileFields.map((field, idx) => (
              <div key={idx} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {field.label}
                </label>
                <div className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all ${
                  field.highlight 
                    ? 'bg-blue-50 border-blue-100 text-blue-700 font-bold' 
                    : 'bg-gray-50 border-gray-100 text-gray-700 font-medium'
                }`}>
                  <span className={field.highlight ? 'text-blue-600' : 'text-gray-400'}>
                    {field.icon}
                  </span>
                  <span className="text-sm">{field.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-amber-50 border border-amber-100 rounded-3xl">
            <h4 className="font-black text-amber-800 mb-2 text-sm uppercase tracking-tight">Security Information</h4>
            <p className="text-xs text-amber-700 font-medium leading-relaxed opacity-80">
              Your account permissions are restricted based on your role as <span className="font-bold underline">{user.role}</span>. 
              If you require changes to your profile data or department assignments, please contact the institutional administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
