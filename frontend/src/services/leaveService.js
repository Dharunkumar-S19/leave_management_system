import api from './api';

/**
 * Service: Apply for a new leave request
 */
const applyLeave = async (leaveData) => {
  const response = await api.post('/leaves/apply', leaveData);
  return response.data;
};

/**
 * Service: Fetch user's own leave requests
 */
const getMyLeaves = async (status = '') => {
  const response = await api.get(`/leaves/my?status=${status}`);
  return response.data;
};

/**
 * Service: Fetch user's leave balance
 */
const getLeaveBalance = async () => {
  const response = await api.get('/leaves/balance');
  return response.data;
};

/**
 * Service: Cancel a pending leave request
 */
const cancelLeave = async (leaveId) => {
  const response = await api.delete(`/leaves/${leaveId}`);
  return response.data;
};

/**
 * Service: Fetch approved leaves from today onwards
 */
const getUpcomingLeaves = async () => {
  const response = await api.get('/student/upcoming-leaves');
  return response.data;
};

/**
 * Service: Approve or Forward Leave
 */
const approveLeave = async (leaveId, remarks) => {
  const response = await api.post(`/leaves/${leaveId}/approve`, { remarks });
  return response.data;
};

/**
 * Service: Reject Leave
 */
const rejectLeave = async (leaveId, remarks) => {
  const response = await api.post(`/leaves/${leaveId}/reject`, { remarks });
  return response.data;
};

const leaveService = {
  applyLeave,
  getMyLeaves,
  getLeaveBalance,
  cancelLeave,
  getUpcomingLeaves,
  approveLeave,
  rejectLeave
};

export default leaveService;
