import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { Product } from '../../types';
import { Search, ShoppingCart, Truck, Package, Filter } from 'lucide-react';
import SaleModal from '../SaleModal';
import PurchaseModal from '../PurchaseModal';

type StockStatus = 'all' | 'inStock' | 'lowStock' | 'outOfStock';
type ExpirationStatus = 'all' | 'expired' | 'expiringSoon';

interface StaffProductListProps {
    viewProduct: (productId: number) => void;
}

const getExpirationStatus = (expirationDate?: string): { text: string; className: string } => {
    if (!expirationDate) return { text: 'N/A', className: 'text-slate-500 dark:text-slate-400' };

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Expired', className: 'px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    if (diffDays <= 30) return { text: `${diffDays}d left`, className: 'px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    return { text: expDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), className: 'text-slate-500 dark:text-slate-400 text-xs' };
};

const StaffProductList: React.FC<StaffProductListProps> = ({ viewProduct }) => {
    const { products, categories } = useData();
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [stockStatusFilter, setStockStatusFilter] = useState<StockStatus>('all');
    const [expirationFilter, setExpirationFilter] = useState<ExpirationStatus>('all');

    const categoryOptions = ['all', ...categories];

    const filteredProducts = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        return products
            .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
            .filter(p => {
                switch (stockStatusFilter) {
                    case 'lowStock': return p.quantity > 0 && p.quantity <= p.low_stock_threshold;
                    case 'outOfStock': return p.quantity === 0;
                    case 'inStock': return p.quantity > p.low_stock_threshold;
                    default: return true;
                }
            })
            .filter(p => {
                switch (expirationFilter) {
                    case 'expired': return p.expiration_date && new Date(p.expiration_date) < now;
                    case 'expiringSoon': return p.expiration_date && new Date(p.expiration_date) >= now && new Date(p.expiration_date) <= thirtyDaysFromNow;
                    default: return true;
                }
            })
            .filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [products, searchTerm, categoryFilter, stockStatusFilter, expirationFilter]);

    const getStatusBadge = (product: Product) => {
        if (product.quantity === 0) return { text: 'Out of Stock', className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' };
        if (product.quantity <= product.low_stock_threshold) return { text: 'Low Stock', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
        return { text: 'In Stock', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    };

    const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Products</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Browse and manage inventory</p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={inputClass + " w-auto"}>
                            {categoryOptions.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
                        </select>
                        <select value={stockStatusFilter} onChange={(e) => setStockStatusFilter(e.target.value as StockStatus)} className={inputClass + " w-auto"}>
                            <option value="all">All Status</option>
                            <option value="inStock">In Stock</option>
                            <option value="lowStock">Low Stock</option>
                            <option value="outOfStock">Out of Stock</option>
                        </select>
                        <select value={expirationFilter} onChange={(e) => setExpirationFilter(e.target.value as ExpirationStatus)} className={inputClass + " w-auto"}>
                            <option value="all">All Expiry</option>
                            <option value="expiringSoon">Expiring Soon</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {filteredProducts.length === 0 ? (
                    <div className="p-12 text-center">
                        <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">No products found</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your filters</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SKU</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Category</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Qty</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Expiry</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {filteredProducts.map(product => {
                                        const status = getStatusBadge(product);
                                        const expiry = getExpirationStatus(product.expiration_date);
                                        return (
                                            <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <button onClick={() => viewProduct(product.id)} className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline text-left">
                                                        {product.name}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">{product.sku}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{product.category}</td>
                                                <td className="px-4 py-3 text-sm font-bold text-right text-slate-900 dark:text-white">{product.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-300">GHS {product.price.toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${status.className}`}>{status.text}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={expiry.className}>{expiry.text}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button onClick={() => setIsSaleModalOpen(true)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors" title="Sell">
                                                            <ShoppingCart size={14} />
                                                        </button>
                                                        <button onClick={() => setIsPurchaseModalOpen(true)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Add Stock">
                                                            <Truck size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
                            {filteredProducts.map(product => {
                                const status = getStatusBadge(product);
                                const expiry = getExpirationStatus(product.expiration_date);
                                return (
                                    <div key={product.id} className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <button onClick={() => viewProduct(product.id)} className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline text-left">
                                                    {product.name}
                                                </button>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{product.sku} · {product.category}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${status.className}`}>{status.text}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mb-3">
                                            <span className="font-bold text-slate-900 dark:text-white">{product.quantity} units</span>
                                            <span className="text-slate-600 dark:text-slate-300">GHS {product.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsSaleModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                                                <ShoppingCart size={14} /> Sell
                                            </button>
                                            <button onClick={() => setIsPurchaseModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                                                <Truck size={14} /> Add
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {isSaleModalOpen && <SaleModal onClose={() => setIsSaleModalOpen(false)} />}
            {isPurchaseModalOpen && <PurchaseModal onClose={() => setIsPurchaseModalOpen(false)} />}
        </div>
    );
};

export default StaffProductList;