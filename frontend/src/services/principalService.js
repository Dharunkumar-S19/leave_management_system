import api from './api';

/**
 * Service: Fetch staff requests forwarded by HOD
 */
const getPendingStaffReviews = async () => {
  const response = await api.get('/principal/pending-staff-reviews');
  return response.data;
};

/**
 * Service: Fetch direct HOD requests
 */
const getPendingHodReviews = async () => {
  const response = await api.get('/principal/pending-hod-reviews');
  return response.data;
};

/**
 * Service: Fetch comprehensive leave report
 */
const getReport = async (filters = {}) => {
  // Clean empty filters
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null && v !== ''));
  const params = new URLSearchParams(cleanFilters).toString();
  const response = await api.get(`/principal/report?${params}`);
  return response.data;
};

/**
 * Service: Download CSV Export
 */
const downloadReportCSV = async (filters = {}) => {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null && v !== ''));
  const params = new URLSearchParams(cleanFilters).toString();
  
  // Use axios to fetch the blob, but we use the custom instance logic
  const response = await api.get(`/principal/report/export?${params}`, {
    responseType: 'blob', // crucial for handling binary data
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  
  // Try extract filename from disposition
  const disposition = response.headers['content-disposition'];
  let filename = 'leave_report.csv';
  if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) { 
        filename = matches[1].replace(/['"]/g, '');
      }
  }

  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
};

const principalService = {
  getPendingStaffReviews,
  getPendingHodReviews,
  getReport,
  downloadReportCSV
};

export default principalService;
