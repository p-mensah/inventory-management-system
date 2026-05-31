import React, { useState } from 'react';
import { Filter, X, Calendar, DollarSign, Package, Building2, RotateCcw } from 'lucide-react';

interface AdvancedFiltersProps {
    onApply: (filters: FilterValues) => void;
    onReset: () => void;
    categories?: string[];
    suppliers?: Array<{ id: number; name: string }>;
}

export interface FilterValues {
    dateFrom?: string;
    dateTo?: string;
    category?: string;
    supplier?: string;
    priceMin?: number;
    priceMax?: number;
    stockStatus?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
    searchTerm?: string;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
    onApply,
    onReset,
    categories = [],
    suppliers = []
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<FilterValues>({
        stockStatus: 'all'
    });

    const handleApply = () => {
        onApply(filters);
        setIsOpen(false);
    };

    const handleReset = () => {
        setFilters({ stockStatus: 'all' });
        onReset();
        setIsOpen(false);
    };

    const activeFilterCount = Object.values(filters).filter(v =>
        v && v !== 'all' && v !== ''
    ).length;

    return (
        <>
            {/* Filter Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
                <Filter className="w-4 h-4" />
                <span className="font-medium text-sm">Filters</span>
                {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {/* Filter Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                    <Filter className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    Advanced Filters
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Date Range */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <Calendar className="w-4 h-4" />
                                    Date Range
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                            From
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.dateFrom || ''}
                                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                            To
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.dateTo || ''}
                                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <DollarSign className="w-4 h-4" />
                                    Price Range (GHS)
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                            Min
                                        </label>
                                        <input
                                            type="number"
                                            value={filters.priceMin || ''}
                                            onChange={(e) => setFilters({ ...filters, priceMin: parseFloat(e.target.value) })}
                                            placeholder="0.00"
                                            className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                            Max
                                        </label>
                                        <input
                                            type="number"
                                            value={filters.priceMax || ''}
                                            onChange={(e) => setFilters({ ...filters, priceMax: parseFloat(e.target.value) })}
                                            placeholder="999999.00"
                                            className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Category */}
                            {categories.length > 0 && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <Package className="w-4 h-4" />
                                        Category
                                    </label>
                                    <select
                                        value={filters.category || ''}
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Supplier */}
                            {suppliers.length > 0 && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <Building2 className="w-4 h-4" />
                                        Supplier
                                    </label>
                                    <select
                                        value={filters.supplier || ''}
                                        onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                    >
                                        <option value="">All Suppliers</option>
                                        {suppliers.map(sup => (
                                            <option key={sup.id} value={sup.id.toString()}>{sup.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Stock Status */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    Stock Status
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: 'all', label: 'All Products' },
                                        { value: 'in-stock', label: 'In Stock' },
                                        { value: 'low-stock', label: 'Low Stock' },
                                        { value: 'out-of-stock', label: 'Out of Stock' }
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setFilters({ ...filters, stockStatus: option.value as any })}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filters.stockStatus === option.value
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-medium text-sm transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset All
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-medium text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdvancedFilters;
