import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Page, TransactionType } from '../../types';
import { ShoppingCart, Package, AlertTriangle, DollarSign, Truck, SlidersHorizontal, TrendingUp, Printer, Clock } from 'lucide-react';
import SaleModal from '../SaleModal';
import PurchaseModal from '../PurchaseModal';
import StockAdjustmentModal from '../StockAdjustmentModal';

interface StaffDashboardProps {
    setCurrentPage: (page: Page) => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ setCurrentPage }) => {
    const { products, transactions } = useData();
    const { user, sessionLoginTime } = useAuth();
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

    const isToday = (dateString: string) => {
        const someDate = new Date(dateString);
        const today = new Date();
        return someDate.getDate() === today.getDate() &&
            someDate.getMonth() === today.getMonth() &&
            someDate.getFullYear() === today.getFullYear();
    };

    const dashboardStats = useMemo(() => {
        const todaysUserTransactions = transactions.filter(t => isToday(t.date) && t.user === user?.name);
        const todaysSales = todaysUserTransactions.filter(t => t.type === TransactionType.Sale);

        const salesCount = todaysSales.length;
        const revenue = todaysSales.reduce((sum, t) => sum + Math.abs(t.quantity_change) * (t.price_per_unit || 0), 0);
        const transactionCount = todaysUserTransactions.length;

        const profit = todaysSales.reduce((sum, t) => {
            const product = products.find(p => p.id === t.product_id);
            if (!product) return sum;
            const profitPerUnit = (t.price_per_unit || product.price) - product.cost;
            return sum + profitPerUnit * Math.abs(t.quantity_change);
        }, 0);

        return { salesCount, revenue, transactionCount, profit };
    }, [products, transactions, user]);

    const lowStockProducts = products.filter(p => p.quantity <= p.low_stock_threshold);
    const userTransactions = useMemo(() => transactions.filter(t => t.user === user?.name).slice(0, 10), [transactions, user]);

    const handlePrintDailySummary = () => {
        const summaryElement = document.getElementById('daily-summary-print');
        if (summaryElement) {
            summaryElement.classList.add('print-show');
            window.onafterprint = () => {
                summaryElement.classList.remove('print-show');
                window.onafterprint = null;
            };
            window.print();
        }
    };

    const getTransactionStyle = (type: TransactionType) => {
        switch (type) {
            case TransactionType.Sale: return { icon: <ShoppingCart size={14} />, bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' };
            case TransactionType.Purchase: return { icon: <Truck size={14} />, bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' };
            case TransactionType.Adjustment: return { icon: <SlidersHorizontal size={14} />, bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' };
        }
    };

    const formatLoginTime = (date: Date | null) => {
        if (!date) return '--:--';
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className="space-y-6">
            {/* Header with Login Time - Light subtle design */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome back,</p>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || 'Staff'}</h1>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs">
                                <Clock size={12} />
                                <span>Logged in</span>
                            </div>
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{formatLoginTime(sessionLoginTime)}</p>
                        </div>
                        <button onClick={handlePrintDailySummary} className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition-colors">
                            <Printer size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Today's Revenue</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">GHS {dashboardStats.revenue.toFixed(0)}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Today's Profit</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">GHS {dashboardStats.profit.toFixed(0)}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sales Count</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboardStats.salesCount}</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Transactions</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboardStats.transactionCount}</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button onClick={() => setIsSaleModalOpen(true)} className="flex items-center gap-3 p-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                        <ShoppingCart size={20} />
                        <span className="text-sm font-medium">Record Sale</span>
                    </button>
                    <button onClick={() => setIsPurchaseModalOpen(true)} className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors">
                        <Truck size={20} />
                        <span className="text-sm font-medium">Receive Stock</span>
                    </button>
                    <button onClick={() => setIsAdjustmentModalOpen(true)} className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors">
                        <SlidersHorizontal size={20} />
                        <span className="text-sm font-medium">Adjust Stock</span>
                    </button>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alerts */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={14} className="text-amber-500" />
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Low Stock Alerts</h2>
                            {lowStockProducts.length > 0 && (
                                <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded">{lowStockProducts.length}</span>
                            )}
                        </div>
                    </div>
                    {lowStockProducts.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-60 overflow-y-auto">
                            {lowStockProducts.slice(0, 5).map(product => (
                                <div key={product.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                                            <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{product.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{product.category}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{product.quantity} left</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">All products well stocked</p>
                        </div>
                    )}
                </div>

                {/* My Recent Transactions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">My Recent Transactions</h2>
                    </div>
                    {userTransactions.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-60 overflow-y-auto">
                            {userTransactions.map(transaction => {
                                const product = products.find(p => p.id === transaction.product_id);
                                const style = getTransactionStyle(transaction.type);
                                return (
                                    <div key={transaction.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 ${style.bg} rounded-lg flex items-center justify-center ${style.text}`}>
                                                {style.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{transaction.type}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{product?.name || 'Unknown'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{Math.abs(transaction.quantity_change)} units</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(transaction.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">No transactions yet today</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden Print Summary */}
            <div id="daily-summary-print" className="hidden print:block">
                <div className="p-8 bg-white text-black">
                    <div className="text-center border-b-2 border-black pb-4 mb-4">
                        <h1 className="text-xl font-bold">JUBEL HAVILAH ENTERPRISE</h1>
                        <p className="text-sm">Daily Staff Summary</p>
                    </div>
                    <div className="mb-4 text-sm">
                        <div className="flex justify-between"><span>Staff Name:</span><span className="font-bold">{user?.name}</span></div>
                        <div className="flex justify-between"><span>Date:</span><span>{new Date().toLocaleDateString()}</span></div>
                        <div className="flex justify-between"><span>Login Time:</span><span>{formatLoginTime(sessionLoginTime)}</span></div>
                    </div>
                    <div className="border-t border-b border-black py-4 mb-4">
                        <h2 className="font-bold mb-2">Today's Summary</h2>
                        <div className="flex justify-between"><span>Total Revenue:</span><span className="font-bold">GHS {dashboardStats.revenue.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Total Profit:</span><span className="font-bold">GHS {dashboardStats.profit.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Sales Count:</span><span className="font-bold">{dashboardStats.salesCount}</span></div>
                        <div className="flex justify-between"><span>Total Transactions:</span><span className="font-bold">{dashboardStats.transactionCount}</span></div>
                    </div>
                    <div className="text-center text-sm text-gray-500">
                        <p>Generated on {new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isSaleModalOpen && <SaleModal onClose={() => setIsSaleModalOpen(false)} />}
            {isPurchaseModalOpen && <PurchaseModal onClose={() => setIsPurchaseModalOpen(false)} />}
            {isAdjustmentModalOpen && <StockAdjustmentModal onClose={() => setIsAdjustmentModalOpen(false)} />}
        </div>
    );
};

export default StaffDashboard;
