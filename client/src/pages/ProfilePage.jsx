import { useState, useEffect } from 'react';
import { usersApi } from '../api/users';
import { ordersApi } from '../api/orders';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import Spinner from '../components/ui/Spinner';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const addToast = useToast();

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwLoading, setPwLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    ordersApi.getAll()
      .then(d => setOrders(d.orders))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  async function handleProfileSave(e) {
    e.preventDefault();
    const errs = {};
    if (!profile.name.trim()) errs.name = 'Name is required';
    if (!profile.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profile.email)) errs.email = 'Invalid email';
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }

    setProfileLoading(true);
    try {
      const { user: updated } = await usersApi.updateProfile(profile);
      updateUser(updated);
      addToast('Profile updated successfully!');
    } catch (err) {
      setProfileErrors({ submit: err.message });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Current password is required';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) errs.newPassword = 'Min 6 characters';
    if (pwForm.newPassword !== pwForm.confirmNew) errs.confirmNew = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    setPwLoading(true);
    try {
      await usersApi.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
      addToast('Password changed successfully!');
    } catch (err) {
      setPwErrors({ submit: err.message });
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            {profileErrors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{profileErrors.submit}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                value={profile.name}
                onChange={e => { setProfile(p => ({ ...p, name: e.target.value })); setProfileErrors(p => ({ ...p, name: '' })); }}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${profileErrors.name ? 'border-red-400' : 'border-gray-300'}`}
              />
              {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={e => { setProfile(p => ({ ...p, email: e.target.value })); setProfileErrors(p => ({ ...p, email: '' })); }}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${profileErrors.email ? 'border-red-400' : 'border-gray-300'}`}
              />
              {profileErrors.email && <p className="text-red-500 text-xs mt-1">{profileErrors.email}</p>}
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {profileLoading && <Spinner size="sm" />}
              Save Changes
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {pwErrors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{pwErrors.submit}</div>
            )}
            {[
              ['currentPassword', 'Current Password'],
              ['newPassword', 'New Password'],
              ['confirmNew', 'Confirm New Password']
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="password"
                  value={pwForm[key]}
                  onChange={e => { setPwForm(p => ({ ...p, [key]: e.target.value })); setPwErrors(p => ({ ...p, [key]: '' })); }}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${pwErrors[key] ? 'border-red-400' : 'border-gray-300'}`}
                />
                {pwErrors[key] && <p className="text-red-500 text-xs mt-1">{pwErrors[key]}</p>}
              </div>
            ))}
            <button
              type="submit"
              disabled={pwLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {pwLoading && <Spinner size="sm" />}
              Change Password
            </button>
          </form>
        </div>
      </div>

      {/* Order History */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Order History</h2>
        {ordersLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No orders yet. Go shop something!</p>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-800">Order #{order.id}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700">${Number(order.total_amount).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'paid' ? 'bg-green-100 text-green-700' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
