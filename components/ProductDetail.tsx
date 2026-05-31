
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Page, Role, TransactionType } from '../types';
import { ArrowLeft, Package, DollarSign, Tag, Building2, Printer, AlertTriangle, History, ShoppingCart, Truck, SlidersHorizontal } from 'lucide-react';
import PrintableReport from './PrintableReport';

interface ProductDetailProps {
    productId: number;
    setCurrentPage: (page: Page) => void;
    backPage: Page;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, setCurrentPage, backPage }) => {
    const { products, getSupplierName, transactions, auditLogs } = useData();
    const { user } = useAuth();
    const product = products.find(p => p.id === productId);
    const [activeTab, setActiveTab] = useState<'transactions' | 'logs'>('transactions');

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Product not found</h2>
                <button onClick={() => setCurrentPage('products')} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">
                    Back to Products
                </button>
            </div>
        );
    }

    const relatedTransactions = transactions.filter(t => t.product_id === product.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const relatedLogs = auditLogs
        .filter(log => log.target_name === product.name && (user?.role !== Role.Staff || log.user_name === user.name))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const getTransactionIcon = (type: TransactionType) => {
        switch (type) {
            case TransactionType.Sale: return <ShoppingCart size={12} className="text-emerald-500" />;
            case TransactionType.Purchase: return <Truck size={12} className="text-blue-500" />;
            case TransactionType.Adjustment: return <SlidersHorizontal size={12} className="text-amber-500" />;
            default: return null;
        }
    };

    const stockStatus = product.quantity === 0 ? 'out' : product.quantity <= product.low_stock_threshold ? 'low' : 'ok';

    return (
        <>
            <div className="space-y-6 no-print">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setCurrentPage(backPage)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <ArrowLeft size={18} className="text-slate-500" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{product.name}</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">SKU: {product.sku}</p>
                        </div>
                    </div>
                    <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                        <Printer size={16} />
                        Print
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stockStatus === 'out' ? 'bg-red-50 dark:bg-red-900/20' : stockStatus === 'low' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                                <Package className={`w-5 h-5 ${stockStatus === 'out' ? 'text-red-600 dark:text-red-400' : stockStatus === 'low' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Stock</p>
                                <p className={`text-xl font-bold ${stockStatus === 'out' ? 'text-red-600' : stockStatus === 'low' ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>{product.quantity}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                                <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Price</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">GHS {product.price.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Cost</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">GHS {product.cost.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Supplier</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{getSupplierName(product.supplier_id)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {stockStatus !== 'ok' && (
                    <div className={`flex items-center gap-3 p-4 rounded-xl ${stockStatus === 'out' ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800'}`}>
                        <AlertTriangle className={`w-5 h-5 ${stockStatus === 'out' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
                        <span className={`text-sm font-medium ${stockStatus === 'out' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>
                            {stockStatus === 'out' ? 'This product is out of stock' : 'This product is running low on stock'}
                        </span>
                    </div>
                )}

                {/* Details & History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Details */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Category</span><span className="font-medium text-slate-900 dark:text-white">{product.category}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Low Stock Alert</span><span className="font-medium text-slate-900 dark:text-white">{product.low_stock_threshold}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Expiration</span><span className="font-medium text-slate-900 dark:text-white">{product.expiration_date ? new Date(product.expiration_date).toLocaleDateString() : 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Last Updated</span><span className="font-medium text-slate-900 dark:text-white">{new Date(product.last_updated).toLocaleDateString()}</span></div>
                        </div>
                    </div>

                    {/* Transactions & Logs */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Transactions ({relatedTransactions.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('logs')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'logs' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Audit Log ({relatedLogs.length})
                            </button>
                        </div>

                        <div className="p-4 max-h-80 overflow-y-auto">
                            {activeTab === 'transactions' && (
                                relatedTransactions.length > 0 ? (
                                    <div className="space-y-2">
                                        {relatedTransactions.map(t => (
                                            <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center">
                                                        {getTransactionIcon(t.type)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{t.type}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-sm font-semibold ${t.quantity_change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {t.quantity_change > 0 ? '+' : ''}{t.quantity_change}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">No transactions</p>
                                    </div>
                                )
                            )}
                            {activeTab === 'logs' && (
                                relatedLogs.length > 0 ? (
                                    <div className="space-y-2">
                                        {relatedLogs.map(log => (
                                            <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{log.action}</p>
                                                    <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">by {log.user_name}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">No audit logs</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Printable Report */}
            <PrintableReport title={`Product: ${product.name}`}>
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div><strong>SKU:</strong> {product.sku}</div>
                    <div><strong>Category:</strong> {product.category}</div>
                    <div><strong>Stock:</strong> {product.quantity}</div>
                    <div><strong>Price:</strong> GHS {product.price.toFixed(2)}</div>
                    <div><strong>Cost:</strong> GHS {product.cost.toFixed(2)}</div>
                    <div><strong>Supplier:</strong> {getSupplierName(product.supplier_id)}</div>
                </div>
                {relatedTransactions.length > 0 && (
                    <div>
                        <h3 className="font-semibold border-b pb-2 mb-2">Recent Transactions</h3>
                        <table className="w-full text-sm">
                            <thead><tr><th className="text-left py-1">Date</th><th className="text-left py-1">Type</th><th className="text-left py-1">Qty</th></tr></thead>
                            <tbody>
                                {relatedTransactions.slice(0, 10).map(t => (
                                    <tr key={t.id}><td className="py-1">{new Date(t.date).toLocaleDateString()}</td><td>{t.type}</td><td>{t.quantity_change}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </PrintableReport>
        </>
    );
};

export default ProductDetail;