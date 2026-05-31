
import React from 'react';
import { Page, Role } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Shield, History, Mail, KeyRound, User } from 'lucide-react';

interface StaffProfileProps {
    setCurrentPage: (page: Page) => void;
}

const StaffProfile: React.FC<StaffProfileProps> = ({ setCurrentPage }) => {
    const { user } = useAuth();

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Password change functionality is not implemented in this demo.');
    };

    const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all";
    const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5";

    const getRoleBadge = (role: Role) => {
        const styles = {
            [Role.Admin]: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
            [Role.Manager]: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
            [Role.Staff]: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
        };
        return styles[role] || 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center font-bold text-2xl text-emerald-600 dark:text-emerald-400 mx-auto">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{user?.name}</h2>
                        <span className={`inline-flex mt-1 px-2 py-0.5 text-xs font-medium rounded ${getRoleBadge(user?.role || Role.Staff)}`}>
                            {user?.role}
                        </span>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Account Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                    <User size={14} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Username</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                    <Mail size={14} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.email || `${user?.name?.toLowerCase().replace(' ', '.')}@jubel.com`}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                    <Shield size={14} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Role</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Change Password */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                            <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                                <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Change Password</h3>
                        </div>
                        <form className="p-4 space-y-4" onSubmit={handleChangePassword}>
                            <div>
                                <label className={labelClass} htmlFor="current-password">Current Password</label>
                                <input type="password" id="current-password" className={inputClass} placeholder="Enter current password" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass} htmlFor="new-password">New Password</label>
                                    <input type="password" id="new-password" className={inputClass} placeholder="Enter new password" />
                                </div>
                                <div>
                                    <label className={labelClass} htmlFor="confirm-password">Confirm Password</label>
                                    <input type="password" id="confirm-password" className={inputClass} placeholder="Confirm new password" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Activity Link */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">My Activity</h3>
                        </div>
                        <div className="p-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">View a complete log of all your sales and stock updates.</p>
                            <button
                                onClick={() => setCurrentPage('staffHistory')}
                                className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                            >
                                View My Transaction History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffProfile;
