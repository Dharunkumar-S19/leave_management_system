import api from './api';

/**
 * Service: Fetch pending student leave reviews for HOD (Level 2)
 */
const getPendingStudentReviews = async () => {
  const response = await api.get('/hod/pending-student-reviews');
  return response.data;
};

/**
 * Service: Fetch pending staff leave reviews for HOD (Level 1)
 */
const getPendingStaffReviews = async () => {
  const response = await api.get('/hod/pending-staff-reviews');
  return response.data;
};

/**
 * Service: Get departmental leave reports
 */
const getReport = async (filters) => {
  const response = await api.get('/hod/report', { params: filters });
  return response.data;
};

/**
 * Service: Download departmental report as CSV
 */
const downloadReportCSV = async (filters) => {
  const response = await api.get('/hod/export', {
    params: filters,
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'department_leave_report.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const hodService = {
  getPendingStudentReviews,
  getPendingStaffReviews,
  getReport,
  downloadReportCSV
};

export default hodService;
