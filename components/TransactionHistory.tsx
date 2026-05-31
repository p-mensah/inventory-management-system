
import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { TransactionType } from '../types';
import { ShoppingCart, Truck, SlidersHorizontal, History, Filter, Search } from 'lucide-react';

interface TransactionHistoryProps {
    userFilter?: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userFilter }) => {
    const { transactions, products, users } = useData();
    const [productFilter, setProductFilter] = useState<string>('all');
    const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            if (userFilter && t.user !== userFilter) return false;
            if (!userFilter && selectedUserFilter !== 'all' && t.user !== selectedUserFilter) return false;
            if (productFilter !== 'all' && t.product_id !== Number(productFilter)) return false;

            const tDate = new Date(t.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && tDate < start) return false;
            if (end) {
                const endOfDay = new Date(end);
                endOfDay.setHours(23, 59, 59, 999);
                if (tDate > endOfDay) return false;
            }

            return true;
        });
    }, [transactions, userFilter, productFilter, selectedUserFilter, startDate, endDate]);

    const getTransactionStyle = (type: TransactionType) => {
        switch (type) {
            case TransactionType.Sale:
                return { icon: <ShoppingCart size={14} />, bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' };
            case TransactionType.Purchase:
                return { icon: <Truck size={14} />, bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' };
            case TransactionType.Adjustment:
                return { icon: <SlidersHorizontal size={14} />, bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' };
            default:
                return { icon: <History size={14} />, bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400' };
        }
    };

    const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40";

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {userFilter ? 'My Transactions' : 'Transaction History'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{filteredTransactions.length} records found</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Filters</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className={inputClass}>
                        <option value="all">All Products</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {!userFilter && (
                        <select value={selectedUserFilter} onChange={e => setSelectedUserFilter(e.target.value)} className={inputClass}>
                            <option value="all">All Users</option>
                            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                        </select>
                    )}
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {filteredTransactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">No transactions match your filters</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block max-h-96">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Type</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Qty</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Amount</th>
                                        {!userFilter && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">User</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {filteredTransactions.map(t => {
                                        const product = products.find(p => p.id === t.product_id);
                                        const amount = t.type === 'Sale' ? Math.abs(t.quantity_change) * (t.price_per_unit || 0) : t.type === 'Purchase' ? t.quantity_change * (t.price_per_unit || 0) : 0;
                                        const style = getTransactionStyle(t.type);
                                        return (
                                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">{product?.name || 'N/A'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded ${style.bg} ${style.text}`}>
                                                        {style.icon}
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className={`px-4 py-3 text-sm font-semibold text-right whitespace-nowrap ${t.quantity_change > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {t.quantity_change > 0 ? `+${t.quantity_change}` : t.quantity_change}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                    {amount > 0 ? `GHS ${amount.toFixed(2)}` : '—'}
                                                </td>
                                                {!userFilter && <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.user}</td>}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/50 max-h-96 overflow-y-auto">
                            {filteredTransactions.map(t => {
                                const product = products.find(p => p.id === t.product_id);
                                const amount = t.type === 'Sale' ? Math.abs(t.quantity_change) * (t.price_per_unit || 0) : t.type === 'Purchase' ? t.quantity_change * (t.price_per_unit || 0) : 0;
                                const style = getTransactionStyle(t.type);
                                return (
                                    <div key={t.id} className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{product?.name || 'N/A'}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${style.bg} ${style.text}`}>
                                                {style.icon}
                                                {t.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={`font-semibold ${t.quantity_change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {t.quantity_change > 0 ? `+${t.quantity_change}` : t.quantity_change} units
                                            </span>
                                            <span className="text-slate-600 dark:text-slate-300">{amount > 0 ? `GHS ${amount.toFixed(2)}` : ''}</span>
                                        </div>
                                        {!userFilter && <p className="text-xs text-slate-400 mt-1">by {t.user}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
