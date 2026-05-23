import { api } from './client';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export async function createProduct(formData) {
  const token = localStorage.getItem('dollar_shop_token');
  const res = await fetch(`${BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.code = data.code;
    err.status = res.status;
    throw err;
  }
  return data;
}

export function getAllOrders() {
  return api.get('/api/admin/orders');
}

export async function updateProduct(id, formData) {
  const token = localStorage.getItem('dollar_shop_token');
  const res = await fetch(`${BASE_URL}/api/admin/products/${id}`, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.code = data.code;
    err.status = res.status;
    throw err;
  }
  return data;
}

export function deleteProduct(id) {
  return api.delete(`/api/admin/products/${id}`);
}
