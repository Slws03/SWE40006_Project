import { useState, useEffect } from 'react';
import { createProduct, getAllOrders } from '../api/admin';
import { useToast } from '../components/ui/Toast';
import Spinner from '../components/ui/Spinner';

const TABS = ['Add Product', 'All Orders'];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminPage() {
  const [tab, setTab] = useState('Add Product');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-8 border-b">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Add Product' ? <AddProductTab /> : <AllOrdersTab />}
    </div>
  );
}

function AddProductTab() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', description: '', category: '', stock: '100' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.category) {
      addToast('Name and category are required', 'error');
      return;
    }

    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('category', form.category);
    fd.append('stock', form.stock);
    if (image) fd.append('image', image);

    setLoading(true);
    try {
      await createProduct(fd);
      addToast('Product created successfully', 'success');
      setForm({ name: '', description: '', category: '', stock: '100' });
      setImage(null);
      setPreview(null);
      e.target.reset();
    } catch (err) {
      addToast(err.message || 'Failed to create product', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="e.g. Gummy Bears"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Short product description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="e.g. Snacks"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
        <input
          name="stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImage}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
        />
        {preview && (
          <img src={preview} alt="preview" className="mt-3 h-32 w-32 object-cover rounded-lg border" />
        )}
      </div>

      <p className="text-xs text-gray-400">Price is fixed at $1.00</p>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <><Spinner size="sm" /> Creating...</> : 'Create Product'}
      </button>
    </form>
  );
}

function AllOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getAllOrders()
      .then(data => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (!orders.length) return <p className="text-gray-500">No orders yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b text-gray-500 text-xs uppercase">
            <th className="pb-2 pr-4">Order ID</th>
            <th className="pb-2 pr-4">Customer</th>
            <th className="pb-2 pr-4">Total</th>
            <th className="pb-2 pr-4">Status</th>
            <th className="pb-2 pr-4">Date</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <>
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-3 pr-4 font-mono text-gray-600">#{order.id}</td>
                <td className="py-3 pr-4">
                  <div className="font-medium">{order.customer_name}</div>
                  <div className="text-gray-400 text-xs">{order.customer_email}</div>
                </td>
                <td className="py-3 pr-4 font-medium">${Number(order.total_amount).toFixed(2)}</td>
                <td className="py-3 pr-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="text-orange-500 hover:text-orange-700 text-xs font-medium"
                  >
                    {expanded === order.id ? 'Hide' : 'Items'}
                  </button>
                </td>
              </tr>
              {expanded === order.id && (
                <tr key={`${order.id}-items`} className="bg-orange-50">
                  <td colSpan={6} className="px-4 py-3">
                    <ul className="space-y-1">
                      {order.items.map((item, i) => (
                        <li key={i} className="flex justify-between text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span className="text-gray-500">${(item.unit_price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
