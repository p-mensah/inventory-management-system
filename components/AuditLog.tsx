
import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { History, Search, Filter } from 'lucide-react';

const AuditLog: React.FC = () => {
    const { auditLogs, users } = useData();
    const [filters, setFilters] = useState({
        user: '',
        action: '',
        targetName: '',
        startDate: '',
        endDate: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const filteredLogs = useMemo(() => {
        return auditLogs.filter(log => {
            const logDate = new Date(log.created_at);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;

            if (startDate && logDate < startDate) return false;
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                if (logDate > endOfDay) return false;
            }
            if (filters.user && log.user_name !== filters.user) return false;
            if (filters.action && log.action !== filters.action) return false;
            if (filters.targetName && !log.target_name.toLowerCase().includes(filters.targetName.toLowerCase())) return false;

            return true;
        });
    }, [auditLogs, filters]);

    const uniqueActions = [...new Set(auditLogs.map(log => log.action))];

    const getActionStyle = (action: string) => {
        if (action.includes('Create')) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
        if (action.includes('Update') || action.includes('Adjustment')) return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
        if (action.includes('Delete')) return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
        if (action.includes('Sale')) return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
        if (action.includes('Purchase')) return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Audit Log</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Track all system activities and changes</p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Filters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            name="targetName"
                            value={filters.targetName}
                            onChange={handleFilterChange}
                            placeholder="Search target..."
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                    </div>
                    <select
                        name="user"
                        value={filters.user}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    >
                        <option value="">All Users</option>
                        {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                    <select
                        name="action"
                        value={filters.action}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    >
                        <option value="">All Actions</option>
                        {uniqueActions.map(action => <option key={action} value={action}>{action}</option>)}
                    </select>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {filteredLogs.length === 0 ? (
                    <div className="p-12 text-center">
                        <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">No logs match the current filters</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Timestamp</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">User</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Action</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Target</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {filteredLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-900 dark:text-white whitespace-nowrap">{log.user_name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getActionStyle(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-900 dark:text-white whitespace-nowrap">{log.target_name}</td>
                                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">{log.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
                            {filteredLogs.map(log => (
                                <div key={log.id} className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{log.action}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">on {log.target_name}</p>
                                        </div>
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getActionStyle(log.action)}`}>
                                            {log.action.split(' ')[0]}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{log.details}</p>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>by {log.user_name}</span>
                                        <span>{new Date(log.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditLog;
