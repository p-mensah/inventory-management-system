
import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { X, SlidersHorizontal, Package } from 'lucide-react';

interface StockAdjustmentModalProps {
  onClose: () => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ onClose }) => {
  const { products, adjustStock } = useData();
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 0);
  const [currentQuantity, setCurrentQuantity] = useState<number>(0);
  const [newQuantity, setNewQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (selectedProduct) {
      setCurrentQuantity(selectedProduct.quantity);
      setNewQuantity(String(selectedProduct.quantity));
    }
  }, [selectedProductId, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for the adjustment.');
      return;
    }
    adjustStock(selectedProductId, parseInt(newQuantity, 10), reason);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all";
  const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5";

  const quantityDiff = parseInt(newQuantity, 10) - currentQuantity;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Adjust Stock</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="product" className={labelClass}>Select Product</label>
              <select
                id="product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className={inputClass}
              >
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>

            {/* Current Stock Display */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Current Stock</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{currentQuantity}</p>
              </div>
            </div>

            <div>
              <label htmlFor="newQuantity" className={labelClass}>New Quantity</label>
              <input
                type="number"
                id="newQuantity"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                required
                className={inputClass}
              />
              {!isNaN(quantityDiff) && quantityDiff !== 0 && (
                <p className={`text-xs mt-1 ${quantityDiff > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {quantityDiff > 0 ? '+' : ''}{quantityDiff} units
                </p>
              )}
            </div>

            <div>
              <label htmlFor="reason" className={labelClass}>Reason for Adjustment</label>
              <input
                type="text"
                id="reason"
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError(''); }}
                required
                placeholder="e.g., Stock count correction"
                className={`${inputClass} ${error ? 'border-red-500 focus:ring-red-500/40' : ''}`}
              />
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">
              Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
