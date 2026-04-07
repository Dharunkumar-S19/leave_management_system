import React, { useState, useEffect } from 'react';
import { X, Calendar, Paperclip, Send, Info } from 'lucide-react';
import leaveService from '../services/leaveService';
import { toast } from 'react-hot-toast';

const ApplyLeaveModal = ({ isOpen, onClose, balance, onFinish }) => {
  const today = new Date().toISOString().split('T')[0];

  const [leaveType, setLeaveType] = useState('CL');
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [daysCount, setDaysCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Calculate working days excluding weekends
  const calculateDays = (start, end) => {
    let count = 0;
    let cur = new Date(start);
    const endDate = new Date(end);
    while (cur <= endDate) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  useEffect(() => {
    if (fromDate && toDate) {
      setDaysCount(calculateDays(fromDate, toDate));
    }
  }, [fromDate, toDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (daysCount === 0) return toast.error('Selected range contains only weekends');

    setLoading(true);
    const formData = new FormData();
    formData.append('leave_type', leaveType);
    formData.append('from_date', fromDate);
    formData.append('to_date', toDate);
    formData.append('reason', reason);
    if (attachment) formData.append('attachment', attachment);

    try {
      await leaveService.applyLeave(formData);
      toast.success('Leave applied successfully!');
      onFinish();
      onClose();
      // Reset form
      setReason('');
      setAttachment(null);
      setFromDate(today);
      setToDate(today);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply leave');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const leaveTypes = [
    { id: 'CL', label: 'Casual Leave', rem: balance?.cl_remaining ?? balance?.cl_total ?? '—' },
    { id: 'ML', label: 'Medical Leave', rem: balance?.ml_remaining ?? balance?.ml_total ?? '—' },
    { id: 'OD', label: 'On Duty', rem: '∞' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Apply for Leave</h2>
            <p className="text-gray-500 text-sm font-medium">New Request · Academic Year 2023-24</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Leave Type */}
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Leave Type</label>
            <div className="grid grid-cols-3 gap-3">
              {leaveTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setLeaveType(type.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    leaveType === type.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="font-bold text-sm">{type.id}</span>
                  <span className="text-[10px] font-bold mt-1 opacity-70">{type.label}</span>
                  <span className="text-[10px] uppercase font-black mt-0.5 opacity-60">Rem: {type.rem}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                min={today}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  if (e.target.value > toDate) setToDate(e.target.value);
                }}
                className="w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-semibold text-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-semibold text-gray-700 text-sm"
              />
            </div>
          </div>

          {/* Days count info */}
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-3 rounded-xl text-blue-700">
            <Info size={16} className="shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Duration: <span className="text-sm font-black">{daysCount} Working Day{daysCount !== 1 ? 's' : ''}</span>
              <span className="normal-case font-medium ml-1">(weekends excluded)</span>
            </span>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Reason for Leave</label>
            <textarea
              required
              rows={3}
              placeholder="Briefly describe the reason for your leave..."
              className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium text-gray-700 resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Attachment (ML only) */}
          {leaveType === 'ML' && (
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                Medical Certificate <span className="normal-case font-medium text-gray-400">(PDF or Image)</span>
              </label>
              <div className="relative group/file">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => setAttachment(e.target.files[0])}
                />
                <label 
                  htmlFor="file-upload"
                  className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <Paperclip size={18} className="text-gray-400 group-hover/file:text-blue-500" />
                    <span className="text-sm font-bold text-gray-500 truncate max-w-[200px]">
                      {attachment ? attachment.name : 'Choose file...'}
                    </span>
                  </div>
                  {attachment && (
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); setAttachment(null); }}
                      className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || daysCount === 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-base transition-all shadow-lg shadow-blue-200 flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <Send size={20} />
                <span>Submit Application</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;
