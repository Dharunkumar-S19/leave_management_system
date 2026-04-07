import React, { useState, useEffect } from 'react';
import hodService from '../../services/hodService';
import { Download, Filter, FileBarChart, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const HodLeaveReport = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    role: '',
    leave_type: '',
    status: '',
    from_date: '',
    to_date: ''
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data, summary } = await hodService.getReport(filters);
      setReportData(data);
      setSummary(summary);
    } catch (err) {
      toast.error('Failed to load departmental data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await hodService.downloadReportCSV(filters);
      toast.success('Departmental report downloaded');
    } catch (err) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
            <FileBarChart size={28} className="mr-3 text-emerald-600" />
            Departmental Analytics
          </h2>
          <p className="text-gray-500 font-bold mt-1 text-sm italic">
            Comprehensive leave tracking and data export for your department members.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-70 group"
        >
          {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="group-hover:-translate-y-1 transition-transform" />}
          <span>{exporting ? 'Generating CSV...' : 'Export Department Data'}</span>
        </button>
      </div>

      {/* Aggregate Metrics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-center">
            <h4 className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-2">Total Requests</h4>
            <span className="text-4xl font-black text-gray-900">{summary.total_requests}</span>
          </div>
          <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 shadow-sm flex flex-col justify-center">
            <h4 className="text-blue-500 font-black uppercase tracking-widest text-[10px] mb-2">CL Approved</h4>
            <span className="text-4xl font-black text-blue-700">{summary.approved_cl_days} <span className="text-sm opacity-60">days</span></span>
          </div>
          <div className="bg-red-50/50 p-6 rounded-[32px] border border-red-100 shadow-sm flex flex-col justify-center">
            <h4 className="text-red-500 font-black uppercase tracking-widest text-[10px] mb-2">ML Approved</h4>
            <span className="text-4xl font-black text-red-700">{summary.approved_ml_days} <span className="text-sm opacity-60">days</span></span>
          </div>
          <div className="bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100 shadow-sm flex flex-col justify-center">
            <h4 className="text-emerald-500 font-black uppercase tracking-widest text-[10px] mb-2">OD Approved</h4>
            <span className="text-4xl font-black text-emerald-700">{summary.approved_od_days} <span className="text-sm opacity-60">days</span></span>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Role Type</label>
            <select name="role" value={filters.role} onChange={handleFilterChange} className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-400 font-bold text-sm text-gray-700">
              <option value="">All Role Types</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Leave Category</label>
            <select name="leave_type" value={filters.leave_type} onChange={handleFilterChange} className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-400 font-bold text-sm text-gray-700">
              <option value="">All Categories</option>
              <option value="CL">Casual Leave</option>
              <option value="ML">Medical Leave</option>
              <option value="OD">On Duty</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-400 font-bold text-sm text-gray-700">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Date Range</label>
              <div className="flex items-center space-x-2">
                <input type="date" name="from_date" value={filters.from_date} onChange={handleFilterChange} className="flex-1 p-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-400 font-bold text-xs text-gray-500" />
                <span className="text-gray-300 font-black">/</span>
                <input type="date" name="to_date" value={filters.to_date} onChange={handleFilterChange} className="flex-1 p-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-400 font-bold text-xs text-gray-500" />
              </div>
          </div>
          <button type="submit" className="px-6 py-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl font-black transition-all flex items-center justify-center space-x-2">
            <Filter size={18} />
            <span>Apply Filters</span>
          </button>
        </form>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50 text-[11px] uppercase tracking-widest font-black text-gray-400 sticky top-0 z-10">
              <tr>
                <th className="px-8 py-6 text-left">UID</th>
                <th className="px-8 py-6 text-left">Member</th>
                <th className="px-8 py-6 text-left">Type</th>
                <th className="px-8 py-6 text-left">Duration</th>
                <th className="px-8 py-6 text-left">Timestamp</th>
                <th className="px-8 py-6 text-right">System Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-24"><Loader2 className="animate-spin text-emerald-600 mx-auto" size={32} /></td></tr>
              ) : reportData.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-24 text-gray-400 font-bold uppercase underline">No matching departmental records</td></tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors group">
                    <td className="px-8 py-5 font-black text-gray-900 group-hover:text-emerald-700 transition-colors">#{(row.id).toString().padStart(5, '0')}</td>
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-900">{row.applicant_name}</div>
                      <div className="text-[10px] font-black tracking-widest uppercase text-gray-400">{row.applicant_role}</div>
                    </td>
                    <td className="px-8 py-5 font-black text-gray-700">{row.leave_type}</td>
                    <td className="px-8 py-5">
                      <div className="text-gray-600 font-bold">
                        {row.days_count} Days
                      </div>
                      <div className="text-[10px] font-bold text-gray-400">
                        {new Date(row.from_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(row.to_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-gray-400 font-bold text-xs italic">
                      {new Date(row.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        row.overall_status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                        row.overall_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {row.overall_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HodLeaveReport;
