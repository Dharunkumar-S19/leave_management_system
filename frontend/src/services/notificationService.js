import api from './api';

const getMyNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

const markAllAsRead = async () => {
  const response = await api.put('/notifications/mark-read');
  return response.data;
};

const notificationService = {
  getMyNotifications,
  markAllAsRead
};

export default notificationService;
