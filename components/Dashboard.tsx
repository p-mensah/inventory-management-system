
import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { Page, TransactionType } from '../types';
import {
    TrendingUp,
    Package,
    DollarSign,
    ShoppingCart,
    AlertTriangle,
    ArrowRight,
    BarChart3,
    Clock,
    Users,
    Truck,
    Calendar,
    Activity,
    Layers
} from 'lucide-react';
import SaleModal from './SaleModal';
import PurchaseModal from './PurchaseModal';
import StockAdjustmentModal from './StockAdjustmentModal';

interface DashboardProps {
    setCurrentPage: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
    const { user, sessionLoginTime } = useAuth();
    const { products, transactions, users } = useData();
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

    const stats = useMemo(() => {
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
        const costValue = products.reduce((sum, p) => sum + (p.quantity * p.cost), 0);
        const lowStockCount = products.filter(p => p.quantity <= p.low_stock_threshold).length;
        const outOfStockCount = products.filter(p => p.quantity === 0).length;
        const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);

        const today = new Date();
        const todayTransactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.toDateString() === today.toDateString();
        });

        const todaySales = todayTransactions
            .filter(t => t.type === TransactionType.Sale)
            .reduce((sum, t) => sum + (Math.abs(t.quantity_change) * (t.price_per_unit || 0)), 0);

        const todayProfit = todayTransactions
            .filter(t => t.type === TransactionType.Sale)
            .reduce((sum, t) => {
                const product = products.find(p => p.id === t.product_id);
                if (!product) return sum;
                return sum + ((t.price_per_unit || product.price) - product.cost) * Math.abs(t.quantity_change);
            }, 0);

        const todaySalesCount = todayTransactions.filter(t => t.type === TransactionType.Sale).length;
        const todayPurchases = todayTransactions.filter(t => t.type === TransactionType.Purchase).length;

        // Week stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekSales = transactions
            .filter(t => new Date(t.date) >= weekAgo && t.type === TransactionType.Sale)
            .reduce((sum, t) => sum + (Math.abs(t.quantity_change) * (t.price_per_unit || 0)), 0);

        return {
            totalProducts, totalValue, costValue, lowStockCount, outOfStockCount, totalStock,
            todaySales, todayProfit, todaySalesCount, todayPurchases, weekSales
        };
    }, [products, transactions]);

    const lowStockProducts = products.filter(p => p.quantity <= p.low_stock_threshold).slice(0, 5);
    const recentTransactions = transactions.slice(0, 8);

    const formatSessionTime = (date: Date | null) => {
        if (!date) return 'Not available';
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const formatSessionDuration = (loginTime: Date | null) => {
        if (!loginTime) return '';
        const now = new Date();
        const diffMs = now.getTime() - loginTime.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <div className="space-y-6">
            {/* Welcome Header with Session Info */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-emerald-200 text-sm font-medium">Welcome back,</p>
                        <h1 className="text-2xl font-bold">{user?.name || 'User'}</h1>
                        <p className="text-emerald-100/80 text-sm mt-1">
                            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2 text-emerald-100">
                                <Clock size={14} />
                                <span className="text-xs font-medium">Session Started</span>
                            </div>
                            <p className="text-lg font-bold mt-0.5">{formatSessionTime(sessionLoginTime)}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2 text-emerald-100">
                                <Activity size={14} />
                                <span className="text-xs font-medium">Duration</span>
                            </div>
                            <p className="text-lg font-bold mt-0.5">{formatSessionDuration(sessionLoginTime)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Today's Summary */}
            <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    Today's Performance
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Revenue</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">GHS {stats.todaySales.toFixed(0)}</p>
                                <p className="text-xs text-slate-500 mt-1">{stats.todaySalesCount} transactions</p>
                            </div>
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Profit</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">GHS {stats.todayProfit.toFixed(0)}</p>
                                <p className={`text-xs mt-1 ${stats.todayProfit > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    {stats.todaySales > 0 ? `${((stats.todayProfit / stats.todaySales) * 100).toFixed(0)}% margin` : 'No sales yet'}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sales</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.todaySalesCount}</p>
                                <p className="text-xs text-slate-500 mt-1">{stats.todayPurchases} purchases</p>
                            </div>
                            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Week Sales</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">GHS {stats.weekSales.toFixed(0)}</p>
                                <p className="text-xs text-slate-500 mt-1">Last 7 days</p>
                            </div>
                            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Overview */}
            <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Layers size={14} className="text-slate-400" />
                    Inventory Overview
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalProducts}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Products</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
                                <Truck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalStock.toLocaleString()}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Total Units</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">GHS {(stats.totalValue / 1000).toFixed(0)}k</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Stock Value</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.lowStockCount}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Low Stock</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.outOfStockCount}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Out of Stock</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                        onClick={() => setShowSaleModal(true)}
                        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <ShoppingCart size={20} />
                        </div>
                        <div className="text-left">
                            <span className="text-sm font-semibold block">Record Sale</span>
                            <span className="text-xs text-emerald-100">Process customer transaction</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setShowPurchaseModal(true)}
                        className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Truck size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                            <span className="text-sm font-semibold block">Receive Stock</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Record incoming goods</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setShowAdjustmentModal(true)}
                        className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                            <BarChart3 size={20} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="text-left">
                            <span className="text-sm font-semibold block">Adjust Stock</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Correct inventory levels</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alert */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={14} className="text-amber-500" />
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Low Stock Alerts</h2>
                        </div>
                        <button
                            onClick={() => setCurrentPage('products')}
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 hover:underline"
                        >
                            View All <ArrowRight size={12} />
                        </button>
                    </div>
                    {lowStockProducts.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {lowStockProducts.map(product => (
                                <div key={product.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${product.quantity === 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                                            <AlertTriangle size={14} className={product.quantity === 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{product.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{product.sku}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-semibold ${product.quantity === 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                        {product.quantity === 0 ? 'Out of stock' : `${product.quantity} left`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">All products are well stocked</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity size={14} className="text-blue-500" />
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
                        </div>
                        <button
                            onClick={() => setCurrentPage('audit')}
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 hover:underline"
                        >
                            View All <ArrowRight size={12} />
                        </button>
                    </div>
                    {recentTransactions.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-80 overflow-y-auto">
                            {recentTransactions.map((transaction) => {
                                const product = products.find(p => p.id === transaction.product_id);
                                const typeStyles = {
                                    Sale: { bg: 'bg-emerald-500', icon: <ShoppingCart size={10} /> },
                                    Purchase: { bg: 'bg-blue-500', icon: <Truck size={10} /> },
                                    Adjustment: { bg: 'bg-amber-500', icon: <BarChart3 size={10} /> }
                                };
                                const style = typeStyles[transaction.type] || typeStyles.Adjustment;
                                return (
                                    <div key={transaction.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 ${style.bg} rounded-full flex items-center justify-center text-white`}>
                                                {style.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{transaction.type}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{product?.name || 'Unknown'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-medium ${transaction.quantity_change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {transaction.quantity_change > 0 ? '+' : ''}{transaction.quantity_change} units
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{transaction.user || 'System'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showSaleModal && <SaleModal onClose={() => setShowSaleModal(false)} />}
            {showPurchaseModal && <PurchaseModal onClose={() => setShowPurchaseModal(false)} />}
            {showAdjustmentModal && <StockAdjustmentModal onClose={() => setShowAdjustmentModal(false)} />}
        </div>
    );
};

export default Dashboard;
