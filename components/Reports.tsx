
import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { useData } from '../hooks/useData';
import { Printer, TrendingUp, DollarSign, Package, ShoppingCart, AlertTriangle, Layers, Percent } from 'lucide-react';
import PrintableReport from './PrintableReport';
import { TransactionType } from '../types';

type ProductSalesData = { name: string; revenue: number; profit: number; unitsSold: number };

const Reports: React.FC = () => {
    const { products, transactions, users, categories, suppliers } = useData();
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: 'All',
        productId: 'All',
        userId: 'All',
        supplierId: 'All',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const setDateRange = (period: 'today' | 'week' | 'month' | 'quarter') => {
        const end = new Date();
        let start = new Date();
        if (period === 'week') start.setDate(end.getDate() - 7);
        else if (period === 'month') start.setMonth(end.getMonth() - 1);
        else if (period === 'quarter') start.setMonth(end.getMonth() - 3);

        setFilters(prev => ({
            ...prev,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        }));
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const product = products.find(p => p.id === t.product_id);
            if (!product) return false;

            const tDate = new Date(t.date);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;

            if (startDate && tDate < startDate) return false;
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                if (tDate > endOfDay) return false;
            }
            if (filters.productId !== 'All' && t.product_id !== Number(filters.productId)) return false;
            if (filters.userId !== 'All' && t.user !== filters.userId) return false;
            if (filters.supplierId !== 'All' && product.supplier_id !== Number(filters.supplierId)) return false;
            if (filters.category !== 'All' && product.category !== filters.category) return false;

            return true;
        });
    }, [transactions, products, filters]);

    // Financial Summary
    const financialSummary = useMemo(() => {
        const salesTransactions = filteredTransactions.filter(t => t.type === TransactionType.Sale);
        const purchaseTransactions = filteredTransactions.filter(t => t.type === TransactionType.Purchase);

        const revenue = salesTransactions.reduce((sum, t) => sum + Math.abs(t.quantity_change) * (t.price_per_unit || 0), 0);
        const cogs = salesTransactions.reduce((sum, t) => {
            const product = products.find(p => p.id === t.product_id);
            return sum + (Math.abs(t.quantity_change) * (product?.cost || 0));
        }, 0);
        const totalPurchases = purchaseTransactions.reduce((sum, t) => {
            const product = products.find(p => p.id === t.product_id);
            return sum + (Math.abs(t.quantity_change) * (product?.cost || 0));
        }, 0);
        const unitsSold = salesTransactions.reduce((sum, t) => sum + Math.abs(t.quantity_change), 0);
        const transactionCount = salesTransactions.length;

        return {
            revenue,
            cogs,
            profit: revenue - cogs,
            margin: revenue > 0 ? ((revenue - cogs) / revenue * 100) : 0,
            totalPurchases,
            unitsSold,
            transactionCount,
            avgOrderValue: transactionCount > 0 ? revenue / transactionCount : 0
        };
    }, [filteredTransactions, products]);

    // Inventory Stats
    const inventoryStats = useMemo(() => {
        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
        const stockValue = products.reduce((sum, p) => sum + (p.quantity * p.cost), 0);
        const retailValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
        const lowStockItems = products.filter(p => p.quantity <= p.low_stock_threshold && p.quantity > 0).length;
        const outOfStock = products.filter(p => p.quantity === 0).length;

        return { totalProducts, totalStock, stockValue, retailValue, lowStockItems, outOfStock };
    }, [products]);

    // Sales by Product
    const salesByProduct = useMemo(() => {
        const result: Record<string, ProductSalesData> = {};
        filteredTransactions
            .filter(t => t.type === TransactionType.Sale)
            .forEach(t => {
                const product = products.find(p => p.id === t.product_id);
                if (!product) return;

                const revenue = Math.abs(t.quantity_change) * (t.price_per_unit || product.price);
                const profit = revenue - (Math.abs(t.quantity_change) * product.cost);
                const unitsSold = Math.abs(t.quantity_change);

                if (!result[product.name]) {
                    result[product.name] = { name: product.name, revenue: 0, profit: 0, unitsSold: 0 };
                }
                result[product.name].revenue += revenue;
                result[product.name].profit += profit;
                result[product.name].unitsSold += unitsSold;
            });
        return result;
    }, [filteredTransactions, products]);

    const salesProductValues = Object.values(salesByProduct) as ProductSalesData[];
    const topProducts = salesProductValues.sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    // Daily sales trend (last 7 days simulation based on transactions)
    const salesTrend = useMemo(() => {
        const days = 7;
        const result = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' });

            const dayRevenue = filteredTransactions
                .filter(t => t.type === TransactionType.Sale && t.date.startsWith(dateStr))
                .reduce((sum, t) => sum + Math.abs(t.quantity_change) * (t.price_per_unit || 0), 0);

            result.push({ name: dayName, revenue: dayRevenue });
        }
        return result;
    }, [filteredTransactions]);

    const uniqueCategories = ['All', ...categories];

    // --- Export helpers ---
    const downloadFile = (filename: string, content: string, mime = 'text/csv') => {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const exportCSV = () => {
        // Export filtered transactions as CSV
        const rows = filteredTransactions.map(t => {
            const product = products.find(p => p.id === t.product_id);
            return {
                date: t.date,
                product: product?.name || t.product_id,
                type: t.type,
                quantity_change: t.quantity_change,
                price_per_unit: t.price_per_unit ?? '',
                user: t.user ?? '',
                notes: t.notes ?? ''
            };
        });

        if (rows.length === 0) {
            setToastMessage?.({ message: 'No transactions to export.', type: 'error' } as any);
            return;
        }

        const header = Object.keys(rows[0]).join(',') + '\n';
        const csv = header + rows.map(r => Object.values(r).map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
        downloadFile(`transactions_${new Date().toISOString().split('T')[0]}.csv`, csv);
    };

    const exportExcelCompatible = () => {
        // Generate CSV but with .xls extension for Excel compatibility
        const rows = products.map(p => ({ id: p.id, name: p.name, sku: p.sku, category: p.category, supplier_id: p.supplier_id, quantity: p.quantity, cost: p.cost, price: p.price, expiration_date: p.expiration_date || '' }));
        if (rows.length === 0) {
            setToastMessage?.({ message: 'No products to export.', type: 'error' } as any);
            return;
        }
        const header = Object.keys(rows[0]).join('\t') + '\n';
        const tsv = header + rows.map(r => Object.values(r).map(v => String(v).replace(/\t/g, ' ')).join('\t')).join('\n');
        downloadFile(`products_${new Date().toISOString().split('T')[0]}.xls`, tsv, 'application/vnd.ms-excel');
    };

    // Card component
    const StatCard = ({ icon: Icon, label, value, subValue, color }: { icon: React.ElementType; label: string; value: string; subValue?: string; color: string }) => (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate">{label}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white truncate">{value}</p>
                    {subValue && <p className="text-xs text-slate-500 dark:text-slate-400">{subValue}</p>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Business Reports</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Sales analytics, inventory insights & performance metrics</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                    >
                        <Printer size={16} />
                        Print / PDF
                    </button>
                    <button
                        onClick={() => exportCSV()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                    >
                        CSV
                    </button>
                    <button
                        onClick={() => exportExcelCompatible()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                    >
                        Excel
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="no-print bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-1">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">From</label>
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">To</label>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
                            <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Supplier</label>
                            <select name="supplierId" value={filters.supplierId} onChange={handleFilterChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                                <option value="All">All</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Product</label>
                            <select name="productId" value={filters.productId} onChange={handleFilterChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                                <option value="All">All</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">User</label>
                            <select name="userId" value={filters.userId} onChange={handleFilterChange} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                                <option value="All">All</option>
                                {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setDateRange('today')} className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Today</button>
                        <button onClick={() => setDateRange('week')} className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Week</button>
                        <button onClick={() => setDateRange('month')} className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Month</button>
                        <button onClick={() => setDateRange('quarter')} className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Quarter</button>
                    </div>
                </div>
            </div>

            {/* Sales Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={TrendingUp} label="Total Revenue" value={`GHS ${financialSummary.revenue.toFixed(2)}`} color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" />
                <StatCard icon={DollarSign} label="Gross Profit" value={`GHS ${financialSummary.profit.toFixed(2)}`} subValue={`${financialSummary.margin.toFixed(1)}% margin`} color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" />
                <StatCard icon={ShoppingCart} label="Units Sold" value={financialSummary.unitsSold.toString()} subValue={`${financialSummary.transactionCount} transactions`} color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" />
                <StatCard icon={Percent} label="Avg Order Value" value={`GHS ${financialSummary.avgOrderValue.toFixed(2)}`} color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" />
            </div>

            {/* Inventory Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Package} label="Total Products" value={inventoryStats.totalProducts.toString()} subValue={`${inventoryStats.totalStock} units in stock`} color="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400" />
                <StatCard icon={Layers} label="Stock Value" value={`GHS ${inventoryStats.stockValue.toFixed(2)}`} subValue={`Retail: GHS ${inventoryStats.retailValue.toFixed(2)}`} color="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400" />
                <StatCard icon={AlertTriangle} label="Low Stock" value={inventoryStats.lowStockItems.toString()} subValue="items need reorder" color="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" />
                <StatCard icon={Package} label="Out of Stock" value={inventoryStats.outOfStock.toString()} subValue="items unavailable" color="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Sales Trend - Area Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Sales Trend (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={salesTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'currentColor' }} />
                            <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} tickFormatter={(v) => `${v}`} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} formatter={(value: number) => [`GHS ${value.toFixed(2)}`, 'Revenue']} />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products - Bar Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Top Products by Revenue</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={topProducts.map(d => ({ ...d, name: d.name.length > 12 ? d.name.substring(0, 10) + '..' : d.name }))} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" />
                            <XAxis type="number" tick={{ fontSize: 10, fill: 'currentColor' }} tickFormatter={(v) => `${v}`} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'currentColor' }} width={80} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} formatter={(value: number) => `GHS ${value.toFixed(2)}`} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="profit" fill="#3b82f6" name="Profit" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Product Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Product</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Units Sold</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Revenue</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Profit</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Margin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {salesProductValues.sort((a, b) => b.revenue - a.revenue).slice(0, 10).map((product) => (
                                <tr key={product.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{product.name}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-300">{product.unitsSold}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-900 dark:text-white font-medium">GHS {product.revenue.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-emerald-600 dark:text-emerald-400 font-medium">GHS {product.profit.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-300">{product.revenue > 0 ? ((product.profit / product.revenue) * 100).toFixed(1) : 0}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Printable Report */}
            <PrintableReport title="Business Performance Report">
                {/* Financial Summary */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 border-b border-gray-300 pb-1">Sales Performance</h3>
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 font-medium text-gray-600">Total Revenue</td>
                                <td className="py-2 text-right font-bold text-gray-900">GHS {financialSummary.revenue.toFixed(2)}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 font-medium text-gray-600">Cost of Goods Sold</td>
                                <td className="py-2 text-right font-bold text-gray-900">GHS {financialSummary.cogs.toFixed(2)}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 font-medium text-gray-600">Gross Profit</td>
                                <td className="py-2 text-right font-bold text-gray-900">GHS {financialSummary.profit.toFixed(2)}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 font-medium text-gray-600">Profit Margin</td>
                                <td className="py-2 text-right font-bold text-gray-900">{financialSummary.margin.toFixed(1)}%</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 font-medium text-gray-600">Units Sold</td>
                                <td className="py-2 text-right font-bold text-gray-900">{financialSummary.unitsSold}</td>
                            </tr>
                            <tr>
                                <td className="py-2 font-medium text-gray-600">Average Order Value</td>
                                <td className="py-2 text-right font-bold text-gray-900">GHS {financialSummary.avgOrderValue.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Top Products */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 border-b border-gray-300 pb-1">Top Selling Products</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-gray-500 uppercase">
                                <th className="py-2 text-left font-medium">Product</th>
                                <th className="py-2 text-right font-medium">Units</th>
                                <th className="py-2 text-right font-medium">Revenue</th>
                                <th className="py-2 text-right font-medium">Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesProductValues.sort((a, b) => b.revenue - a.revenue).slice(0, 10).map((d, idx) => (
                                <tr key={d.name} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                                    <td className="py-2 font-medium text-gray-900">{d.name}</td>
                                    <td className="py-2 text-right text-gray-700">{d.unitsSold}</td>
                                    <td className="py-2 text-right text-gray-700">GHS {d.revenue.toFixed(2)}</td>
                                    <td className="py-2 text-right text-gray-700">GHS {d.profit.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Inventory Summary */}
                <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 border-b border-gray-300 pb-1">Inventory Status</h3>
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 font-medium text-gray-600">Total Products</td>
                                <td className="py-2 text-right font-bold text-gray-900">{inventoryStats.totalProducts}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 font-medium text-gray-600">Total Stock Units</td>
                                <td className="py-2 text-right font-bold text-gray-900">{inventoryStats.totalStock}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 font-medium text-gray-600">Stock Value (Cost)</td>
                                <td className="py-2 text-right font-bold text-gray-900">GHS {inventoryStats.stockValue.toFixed(2)}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 font-medium text-gray-600">Retail Value</td>
                                <td className="py-2 text-right font-bold text-gray-900">GHS {inventoryStats.retailValue.toFixed(2)}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 font-medium text-gray-600">Low Stock Items</td>
                                <td className="py-2 text-right font-bold text-orange-600">{inventoryStats.lowStockItems}</td>
                            </tr>
                            <tr>
                                <td className="py-2 font-medium text-gray-600">Out of Stock Items</td>
                                <td className="py-2 text-right font-bold text-red-600">{inventoryStats.outOfStock}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </PrintableReport>
        </div>
    );
};

export default Reports;
