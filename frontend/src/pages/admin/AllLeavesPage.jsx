import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { Download, Filter, FileBarChart, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AllLeavesPage = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dept_id: '',
    role: '',
    leave_type: '',
    status: '',
  });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllLeaves(filters);
      setReportData(response.data.data);
    } catch (err) {
      toast.error('Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchLeaves();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center uppercase tracking-tighter">
            <FileBarChart size={28} className="mr-3 text-indigo-600" />
            Global Archives
          </h2>
          <p className="text-gray-500 font-bold mt-1 text-sm italic">
            Complete database of all institutional leave records and status history.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <form onSubmit={handleApplyFilters} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Role Filter</label>
            <select 
              value={filters.role} 
              onChange={(e) => setFilters({...filters, role: e.target.value})} 
              className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-400 font-bold text-sm text-gray-700 transition-all"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="hod">HOD</option>
              <option value="principal">Principal</option>
            </select>
          </div>
          <button type="submit" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all active:scale-95 uppercase tracking-widest text-[10px]">
            Filter Records
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50 text-[11px] uppercase tracking-widest font-black text-gray-400">
              <tr>
                <th className="px-6 py-6 text-left">Applicant ID</th>
                <th className="px-6 py-6 text-left">Internal User</th>
                <th className="px-6 py-6 text-left">Leave Profile</th>
                <th className="px-6 py-6 text-left">Duration</th>
                <th className="px-6 py-6 text-right">System Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-20"><Loader2 className="animate-spin text-indigo-600 mx-auto" /></td></tr>
              ) : reportData.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-20 font-black text-gray-300 italic">No archive entries found matching current criteria</td></tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row.id} className="hover:bg-indigo-50/10 transition-colors group">
                    <td className="px-6 py-5 font-black text-gray-900 tracking-tight">#{(row.applicant_id).toString().padStart(4, '0')}</td>
                    <td className="px-6 py-5">
                      <div className="font-black text-gray-800 group-hover:text-indigo-600 transition-colors">{row.applicant_name}</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{row.applicant_role}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-black text-gray-800">{row.leave_type}</span>
                    </td>
                    <td className="px-6 py-5 text-gray-500 font-bold">
                       {row.days_count} Days
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                        row.overall_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        row.overall_status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
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

export default AllLeavesPage;
