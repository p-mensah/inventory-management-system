
import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { User, Role } from '../types';
import { X, Users } from 'lucide-react';

interface UserModalProps {
  user: User | null;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose }) => {
  const { addUser, updateUser } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: Role.Staff,
    notifications_enabled: false,
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email || '',
        role: user.role,
        notifications_enabled: user.notifications_enabled || false,
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      updateUser({ ...user, ...formData });
    } else {
      alert("Please use Supabase's authentication system to add new users.");
    }
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-600";
  const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {user ? 'Edit User' : 'Add User'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label htmlFor="name" className={labelClass}>Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required disabled={!!user} className={inputClass} />
            </div>
            <div>
              <label htmlFor="role" className={labelClass}>Role</label>
              <select name="role" id="role" value={formData.role} onChange={handleChange} className={inputClass}>
                {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {(formData.role === Role.Admin || formData.role === Role.Manager) && (
              <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    id="notifications_enabled"
                    name="notifications_enabled"
                    type="checkbox"
                    checked={formData.notifications_enabled}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <label htmlFor="notifications_enabled" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Low Stock Alerts
                    </label>
                    <p className="text-xs text-slate-500">Receive email/SMS notifications</p>
                  </div>
                </div>
                {formData.notifications_enabled && (
                  <div>
                    <label htmlFor="phone" className={labelClass}>Phone Number</label>
                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder="+233..." className={inputClass} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">
              {user ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
