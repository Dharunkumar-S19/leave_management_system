import api from './api';

/**
 * Service: Fetch pending student leave reviews for staff
 */
const getPendingReviews = async () => {
  const response = await api.get('/staff/pending-reviews');
  return response.data;
};

/**
 * Service: Forward student leave to HOD
 */
const forwardStudentLeave = async (leaveId, remarks) => {
  const response = await api.post(`/staff/leaves/${leaveId}/forward`, { remarks });
  return response.data;
};

/**
 * Service: Reject student leave
 */
const rejectStudentLeave = async (leaveId, remarks) => {
  const response = await api.post(`/staff/leaves/${leaveId}/reject`, { remarks });
  return response.data;
};

const staffService = {
  getPendingReviews,
  forwardStudentLeave,
  rejectStudentLeave
};

export default staffService;
