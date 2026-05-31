
import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Role, Product } from '../types';
import {
  Plus,
  Edit,
  Trash2,
  FileDown,
  Printer,
  Package,
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  Scan
} from 'lucide-react';
import ProductModal from './ProductModal';
import ConfirmationModal from './ConfirmationModal';
import BulkStockAdjustmentModal from './BulkStockAdjustmentModal';
import AdvancedFilters, { FilterValues } from './AdvancedFilters';
import BarcodeScanner from './BarcodeScanner';

interface ProductListProps {
  viewProduct: (productId: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({ viewProduct }) => {
  const { products, suppliers, deleteProduct } = useData();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkAdjustmentOpen, setBulkAdjustmentOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category))),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    if (filters.category) filtered = filtered.filter(p => p.category === filters.category);
    if (filters.supplier) filtered = filtered.filter(p => p.supplier_id?.toString() === filters.supplier);
    if (filters.priceMin !== undefined) filtered = filtered.filter(p => p.price >= filters.priceMin!);
    if (filters.priceMax !== undefined) filtered = filtered.filter(p => p.price <= filters.priceMax!);
    if (filters.stockStatus && filters.stockStatus !== 'all') {
      filtered = filtered.filter(p => {
        if (filters.stockStatus === 'in-stock') return p.quantity > p.low_stock_threshold;
        if (filters.stockStatus === 'low-stock') return p.quantity > 0 && p.quantity <= p.low_stock_threshold;
        if (filters.stockStatus === 'out-of-stock') return p.quantity === 0;
        return true;
      });
    }

    return filtered;
  }, [products, searchQuery, filters]);

  const openModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const openConfirmModal = (id: number) => {
    setDeletingId(id);
    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
    setDeletingId(null);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteProduct(deletingId);
      closeConfirmModal();
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const exportToCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Price', 'Cost', 'Stock Status'];
    const rows = filteredProducts.map(p => [
      p.sku,
      p.name,
      p.category,
      p.quantity,
      p.price,
      p.cost,
      p.quantity === 0 ? 'Out of Stock' : p.quantity <= p.low_stock_threshold ? 'Low Stock' : 'In Stock'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.sku === barcode);
    if (product) {
      viewProduct(product.id);
    } else {
      alert(`No product found with barcode: ${barcode}`);
    }
  };

  const getStockBadge = (product: Product) => {
    if (product.quantity === 0) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"><AlertCircle size={10} /> Out</span>;
    }
    if (product.quantity <= product.low_stock_threshold) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"><AlertCircle size={10} /> Low</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"><CheckCircle size={10} /> OK</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            {searchQuery || Object.keys(filters).length > 0 ? ' (filtered)' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowScanner(true)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title="Scan Barcode"
          >
            <Scan size={16} />
          </button>
          <button
            onClick={exportToCSV}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title="Export CSV"
          >
            <FileDown size={16} />
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title="Print"
          >
            <Printer size={16} />
          </button>
          {user?.role !== Role.Staff && (
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus size={16} />
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
        <AdvancedFilters
          categories={categories}
          suppliers={suppliers}
          onApply={setFilters}
          onReset={() => setFilters({})}
        />
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            {selectedIds.length} selected
          </p>
          <button
            onClick={() => setBulkAdjustmentOpen(true)}
            className="px-3 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Bulk Adjust
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-3 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">SKU</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Product</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Category</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Qty</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Price</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={(e) => handleSelectOne(e, product.id)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{product.sku}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={14} className="text-slate-500 dark:text-slate-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs text-slate-600 dark:text-slate-400">{product.category}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={`text-sm font-medium ${product.quantity === 0 ? 'text-red-600 dark:text-red-400' : product.quantity <= product.low_stock_threshold ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">GHS {product.price.toFixed(2)}</span>
                    </td>
                    <td className="px-3 py-3 text-center">{getStockBadge(product)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => viewProduct(product.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        {user?.role !== Role.Staff && (
                          <>
                            <button
                              onClick={() => openModal(product)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => openConfirmModal(product.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {searchQuery || Object.keys(filters).length > 0
                        ? 'No products match your search'
                        : 'No products yet'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && <ProductModal product={editingProduct} onClose={closeModal} />}
      {confirmModalOpen && (
        <ConfirmationModal
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={closeConfirmModal}
        />
      )}
      {bulkAdjustmentOpen && (
        <BulkStockAdjustmentModal
          productIds={selectedIds}
          onClose={() => {
            setBulkAdjustmentOpen(false);
            setSelectedIds([]);
          }}
        />
      )}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default ProductList;
