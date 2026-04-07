import api from './api';

/**
 * Service: User login API call
 */
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Service: Fetch current user profile API call
 */
const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Service: Logout (Local cleanup handled in AuthContext)
 */
const logout = () => {
  localStorage.removeItem('token');
};

const authService = {
  login,
  getMe,
  logout
};

export default authService;
