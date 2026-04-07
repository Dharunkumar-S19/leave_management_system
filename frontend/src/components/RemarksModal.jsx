import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const RemarksModal = ({ isOpen, onClose, onSubmit, actionType, loading, customActionLabel }) => {
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const isPositive = actionType === 'approve' || actionType === 'forward';

  const handleSubmit = () => {
    onSubmit(remarks);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl p-10 relative animate-in zoom-in-95 duration-300 border border-gray-100">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>

        <h3 className={`text-2xl font-black mb-1 tracking-tight uppercase italic ${isPositive ? 'text-indigo-600' : 'text-rose-600'}`}>
          {actionType === 'reject' ? 'Terminal Rejection' : customActionLabel || 'Executive Authorization'}
        </h3>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">
           Decision Node: {actionType === 'reject' ? 'Terminate' : 'Authorize'} Action Authority
        </p>

        <textarea
          rows={4}
          required={actionType === 'reject'}
          className="w-full p-6 rounded-[24px] border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-400 outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300 italic"
          placeholder="Enter formal justification or audit remarks..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Abort Action
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (actionType === 'reject' && !remarks.trim())}
            className={`flex items-center justify-center px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-2xl transition-all active:scale-95 ${
              isPositive ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
            } disabled:opacity-50`}
          >
            {loading && <Loader2 size={16} className="animate-spin mr-3" />}
            {loading ? 'Processing Node...' : 'Commit Decision'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemarksModal;
