import api from './api';

const getPrincipalRequests = () => api.get('/admin/principal-requests');
const approveLeave = (id, remarks) => api.post(`/admin/approve/${id}`, { remarks });
const rejectLeave = (id, remarks) => api.post(`/admin/reject/${id}`, { remarks });
const getAllUsers = () => api.get('/admin/users');
const createUser = (userData) => api.post('/admin/users', userData);
const updateUser = (id, userData) => api.put(`/admin/users/${id}`, userData);
const deleteUser = (id) => api.delete(`/admin/users/${id}`);
const toggleUserStatus = (id) => api.put(`/admin/users/${id}/toggle`);
const getAllLeaves = (params) => api.get('/admin/all-leaves', { params });

const adminService = {
  getPrincipalRequests,
  approveLeave,
  rejectLeave,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getAllLeaves,
};

export default adminService;
