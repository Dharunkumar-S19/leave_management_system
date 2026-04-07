import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, User, Tag, Clock, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';

const LeaveDetailModal = ({ leaveId, isOpen, onClose }) => {
  const [details, setDetails] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && leaveId) {
      setLoading(true);
      api.get(`/leaves/${leaveId}/details`)
        .then(res => {
          setDetails(res.data.leave);
          setAudit(res.data.audit);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setDetails(null);
      setAudit([]);
    }
  }, [isOpen, leaveId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-50 p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Leave Request Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="font-bold">Fetching Audit Trail...</p>
            </div>
          ) : details ? (
            <div className="space-y-8">
              {/* Top Banner Info */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><User size={24} /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-blue-500">Applicant</p>
                    <p className="font-black text-blue-900">{details.applicant_name}</p>
                    <p className="text-xs font-bold text-blue-600 uppercase">{details.applicant_role} • Dept {details.department_id}</p>
                  </div>
                </div>

                <div className="flex-1 min-w-[200px] bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-xl text-green-600"><Tag size={24} /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-green-500">Leave Type</p>
                    <p className="font-black text-green-900">{details.leave_type}</p>
                    <p className="text-xs font-bold text-green-600">{details.days_count} Days</p>
                  </div>
                </div>
              </div>

              {/* General Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center"><Calendar size={14} className="mr-2" /> Dates</h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 font-bold text-slate-700">
                    {new Date(details.from_date).toLocaleDateString('en-GB')} <ArrowRight size={14} className="inline mx-2 text-slate-400" /> {new Date(details.to_date).toLocaleDateString('en-GB')}
                  </div>
                </div>
                <div>
                   <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center"><FileText size={14} className="mr-2" /> Attachment</h4>
                   <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 flex items-center">
                     {details.attachment_url ? (
                        <a href={details.attachment_url} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:text-blue-800 flex items-center">
                          View Attached Document
                        </a>
                     ) : (
                        <span className="font-bold text-slate-400">No Document Provided</span>
                     )}
                   </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Reason</h4>
                <p className="font-medium text-slate-700 leading-relaxed">
                  {details.reason}
                </p>
              </div>

              {/* Audit Ledger */}
              <div>
                <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center border-b border-gray-100 pb-4">
                  <Clock size={20} className="mr-2 text-blue-500" /> Audit Trail
                </h4>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {/* Ledger Item: Creation */}
                   <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <User size={16} />
                     </div>
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{new Date(details.created_at).toLocaleString()}</p>
                        <h5 className="font-black text-gray-800 text-sm">Application Submitted</h5>
                        <p className="text-sm font-medium text-gray-500">By {details.applicant_name}</p>
                     </div>
                   </div>

                  {/* Ledger Items: Audit Log */}
                  {audit.map((log) => (
                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                        log.action.includes('Rejected') ? 'bg-red-100 text-red-500' : 
                        log.action.includes('Final') ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                         <Clock size={16} />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{new Date(log.created_at).toLocaleString()}</p>
                         <h5 className={`font-black text-sm ${
                            log.action.includes('Rejected') ? 'text-red-700' : 
                            log.action.includes('Final') ? 'text-green-700' : 'text-amber-700'
                         }`}>{log.action}</h5>
                         <p className="text-sm font-medium text-gray-500 mb-2">By {log.actor_name} ({log.actor_role})</p>
                         {log.remarks && (
                           <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <p className="text-xs font-bold text-slate-500 italic">"{log.remarks}"</p>
                           </div>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <p className="text-center py-10 text-red-500">Failed to load details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveDetailModal;
