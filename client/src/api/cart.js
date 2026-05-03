import { api } from './client';

export const cartApi = {
  get: () => api.get('/api/cart'),
  add: (productId, quantity) => api.post('/api/cart', { productId, quantity }),
  update: (productId, quantity) => api.put(`/api/cart/${productId}`, { quantity }),
  remove: (productId) => api.delete(`/api/cart/${productId}`),
  clear: () => api.delete('/api/cart')
};
