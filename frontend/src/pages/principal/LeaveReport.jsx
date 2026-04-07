import React, { useState, useEffect } from 'react';
import principalService from '../../services/principalService';
import { Download, Filter, Search, FileBarChart, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LeaveReport = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    dept_id: '',
    role: '',
    leave_type: '',
    status: '',
    from_date: '',
    to_date: ''
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data, summary } = await principalService.getReport(filters);
      setReportData(data);
      setSummary(summary);
    } catch (err) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []); // Run on mount

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
      await principalService.downloadReportCSV(filters);
      toast.success('Report downloaded successfully');
    } catch (err) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
            <FileBarChart size={28} className="mr-3 text-slate-800" />
            Global Leave Report
          </h2>
          <p className="text-gray-500 font-bold mt-1 text-sm">
            Analytics and data export for all institutional leave applications.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-70"
        >
          {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          <span>{exporting ? 'Generating...' : 'Export to CSV'}</span>
        </button>
      </div>

      {/* Aggregate Metrics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Total Leaves</h4>
            <span className="text-4xl font-black text-slate-800">{summary.total_requests}</span>
          </div>
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 shadow-sm flex flex-col justify-center">
            <h4 className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-1">Total CL Used</h4>
            <span className="text-4xl font-black text-blue-700">{summary.approved_cl_days} <span className="text-lg opacity-50">days</span></span>
          </div>
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm flex flex-col justify-center">
            <h4 className="text-red-500 font-bold uppercase tracking-widest text-xs mb-1">Total ML Used</h4>
            <span className="text-4xl font-black text-red-700">{summary.approved_ml_days} <span className="text-lg opacity-50">days</span></span>
          </div>
          <div className="bg-green-50 p-6 rounded-3xl border border-green-100 shadow-sm flex flex-col justify-center">
            <h4 className="text-green-500 font-bold uppercase tracking-widest text-xs mb-1">Total OD Used</h4>
            <span className="text-4xl font-black text-green-700">{summary.approved_od_days} <span className="text-lg opacity-50">days</span></span>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <form onSubmit={handleApplyFilters} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Role</label>
            <select name="role" value={filters.role} onChange={handleFilterChange} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-slate-400 font-medium text-sm">
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="hod">HOD</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Dept ID</label>
            <input type="number" name="dept_id" value={filters.dept_id} onChange={handleFilterChange} placeholder="e.g. 1" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-slate-400 font-medium text-sm" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Leave Type</label>
            <select name="leave_type" value={filters.leave_type} onChange={handleFilterChange} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-slate-400 font-medium text-sm">
              <option value="">All Types</option>
              <option value="CL">Casual Leave</option>
              <option value="ML">Medical Leave</option>
              <option value="OD">On Duty</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-slate-400 font-medium text-sm">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">From</label>
            <input type="date" name="from_date" value={filters.from_date} onChange={handleFilterChange} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-slate-400 font-medium text-sm text-gray-500" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">To</label>
            <input type="date" name="to_date" value={filters.to_date} onChange={handleFilterChange} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-slate-400 font-medium text-sm text-gray-500" />
          </div>
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <button type="submit" className="w-full md:w-auto px-6 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl font-bold transition-colors flex items-center justify-center">
              <Filter size={18} className="mr-2" /> Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-widest font-bold text-slate-500 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-5 text-left">Applicant ID</th>
                <th className="px-6 py-5 text-left">Name & Role</th>
                <th className="px-6 py-5 text-left">Dept</th>
                <th className="px-6 py-5 text-left">Type</th>
                <th className="px-6 py-5 text-left">Duration</th>
                <th className="px-6 py-5 text-left">Applied On</th>
                <th className="px-6 py-5 text-right">Overall Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-400 font-bold">Loading records...</td></tr>
              ) : reportData.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-400 font-bold">No records matched your filters.</td></tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-900">#{(row.applicant_id).toString().padStart(4, '0')}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{row.applicant_name}</div>
                      <div className="text-[10px] font-black tracking-widest uppercase text-slate-400">{row.applicant_role}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-600">D{row.department_id}</td>
                    <td className="px-6 py-4 font-black tracking-wide text-slate-700">{row.leave_type}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 font-medium">
                        {new Date(row.from_date).toLocaleDateString('en-GB')} - {new Date(row.to_date).toLocaleDateString('en-GB')}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.days_count} Days</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(row.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        row.overall_status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                        row.overall_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
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

export default LeaveReport;
