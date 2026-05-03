import { api } from './client';

export const ordersApi = {
  create: (shippingAddress) => api.post('/api/orders', { shippingAddress }),
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`)
};
