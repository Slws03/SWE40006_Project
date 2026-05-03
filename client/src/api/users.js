import { api } from './client';

export const usersApi = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  updatePassword: (data) => api.put('/api/users/password', data)
};
