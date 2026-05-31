
import React from 'react';
import { useData } from '../hooks/useData';
import { Page, POStatus } from '../types';
import { ArrowLeft, Printer, Building2, DollarSign, Calendar, CheckCircle, Truck, Clock, Package } from 'lucide-react';
import PrintableReport from './PrintableReport';

interface PurchaseOrderDetailProps {
    purchaseOrderId: number;
    setCurrentPage: (page: Page) => void;
}

const PurchaseOrderDetail: React.FC<PurchaseOrderDetailProps> = ({ purchaseOrderId, setCurrentPage }) => {
    const { purchaseOrders, getSupplierName, products } = useData();
    const po = purchaseOrders.find(p => p.id === purchaseOrderId);

    if (!po) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Purchase Order not found</h2>
                <button onClick={() => setCurrentPage('purchaseOrders')} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">
                    Back to Orders
                </button>
            </div>
        );
    }

    const statusConfig = {
        [POStatus.Pending]: { icon: <Clock size={16} />, bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
        [POStatus.Shipped]: { icon: <Truck size={16} />, bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
        [POStatus.Received]: { icon: <CheckCircle size={16} />, bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    };

    const config = statusConfig[po.status];

    return (
        <>
            <div className="space-y-6 no-print">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setCurrentPage('purchaseOrders')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <ArrowLeft size={18} className="text-slate-500" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Purchase Order #{po.id}</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{getSupplierName(po.supplier_id)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${config.badge}`}>
                            {config.icon}
                            {po.status}
                        </span>
                        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                            <Printer size={16} />
                            Print
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
                                <span className={config.text}>{config.icon}</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{po.status}</p>
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
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{getSupplierName(po.supplier_id)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">GHS {po.total_cost.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Created</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(po.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Order Items ({po.items.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SKU</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Qty</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cost</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {po.items.map(item => {
                                    const product = products.find(p => p.id === item.product_id);
                                    return (
                                        <tr key={item.product_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{product?.name || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 font-mono">{product?.sku || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-900 dark:text-white text-right">{item.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-right">GHS {item.cost.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white text-right">GHS {(item.quantity * item.cost).toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                                    <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase">Total</td>
                                    <td className="px-4 py-3 text-right text-lg font-bold text-slate-900 dark:text-white">GHS {po.total_cost.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {/* Printable Invoice */}
            <PrintableReport title={`Purchase Order #${po.id}`}>
                <div className="mb-6 grid grid-cols-2 gap-8 text-sm">
                    <div>
                        <h3 className="font-semibold border-b pb-2 mb-2">Supplier</h3>
                        <p>{getSupplierName(po.supplier_id)}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>Status:</strong> {po.status}</p>
                        <p><strong>Created:</strong> {new Date(po.created_at).toLocaleDateString()}</p>
                        <p><strong>Updated:</strong> {new Date(po.updated_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-900">
                            <th className="py-2 text-left">Product</th>
                            <th className="py-2 text-left">SKU</th>
                            <th className="py-2 text-right">Qty</th>
                            <th className="py-2 text-right">Cost</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {po.items.map(item => {
                            const product = products.find(p => p.id === item.product_id);
                            return (
                                <tr key={item.product_id} className="border-b">
                                    <td className="py-2">{product?.name}</td>
                                    <td className="py-2">{product?.sku}</td>
                                    <td className="py-2 text-right">{item.quantity}</td>
                                    <td className="py-2 text-right">GHS {item.cost.toFixed(2)}</td>
                                    <td className="py-2 text-right">GHS {(item.quantity * item.cost).toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-gray-900">
                            <td colSpan={4} className="py-2 text-right font-bold">GRAND TOTAL</td>
                            <td className="py-2 text-right font-bold">GHS {po.total_cost.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </PrintableReport>
        </>
    );
};

export default PurchaseOrderDetail;
