
import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { Product } from '../types';
import { X, Package } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { categories, suppliers, addProduct, updateProduct } = useData();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    supplier_id: suppliers[0]?.id || 0,
    cost: 0,
    price: 0,
    quantity: 0,
    low_stock_threshold: 10,
    expiration_date: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        supplier_id: product.supplier_id,
        cost: product.cost,
        price: product.price,
        quantity: product.quantity,
        low_stock_threshold: product.low_stock_threshold,
        expiration_date: product.expiration_date ? new Date(product.expiration_date).toISOString().split('T')[0] : '',
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numFields = ['supplier_id', 'cost', 'price', 'quantity', 'low_stock_threshold'];
    setFormData(prev => ({ ...prev, [name]: numFields.includes(name) ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      expiration_date: formData.expiration_date ? new Date(formData.expiration_date).toISOString() : undefined
    };

    if (product) {
      updateProduct({ ...product, ...productData });
    } else {
      addProduct(productData);
    }
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all";
  const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {product ? 'Edit Product' : 'Add Product'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label htmlFor="name" className={labelClass}>Product Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="Enter product name" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sku" className={labelClass}>SKU</label>
                <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} required className={inputClass} placeholder="e.g., PRD-001" />
              </div>
              <div>
                <label htmlFor="category" className={labelClass}>Category</label>
                <input list="categories" type="text" name="category" id="category" value={formData.category} onChange={handleChange} required className={inputClass} placeholder="Select or type" />
                <datalist id="categories">
                  {categories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
              </div>
            </div>

            <div>
              <label htmlFor="supplier_id" className={labelClass}>Supplier</label>
              <select name="supplier_id" id="supplier_id" value={formData.supplier_id} onChange={handleChange} className={inputClass}>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cost" className={labelClass}>Cost Price (GHS)</label>
                <input type="number" step="0.01" name="cost" id="cost" value={formData.cost} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="price" className={labelClass}>Selling Price (GHS)</label>
                <input type="number" step="0.01" name="price" id="price" value={formData.price} onChange={handleChange} required className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="quantity" className={labelClass}>Stock Quantity</label>
                <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="low_stock_threshold" className={labelClass}>Low Stock Alert</label>
                <input type="number" name="low_stock_threshold" id="low_stock_threshold" value={formData.low_stock_threshold} onChange={handleChange} required className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="expiration_date" className={labelClass}>Expiration Date (Optional)</label>
              <input type="date" name="expiration_date" id="expiration_date" value={formData.expiration_date} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">
              {product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
