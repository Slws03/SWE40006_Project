import { api } from './client';

export const productsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/products${qs ? '?' + qs : ''}`);
  },
  getById: (id) => api.get(`/api/products/${id}`),
  getCategories: () => api.get('/api/products/categories')
};
