
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { X, SlidersHorizontal, Package } from 'lucide-react';

interface BulkStockAdjustmentModalProps {
  productIds: number[];
  onClose: () => void;
}

const BulkStockAdjustmentModal: React.FC<BulkStockAdjustmentModalProps> = ({ productIds, onClose }) => {
  const { products, bulkAdjustStock } = useData();
  const [quantityChange, setQuantityChange] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const selectedProducts = products.filter(p => productIds.includes(p.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('A reason for the adjustment is required.');
      return;
    }

    const change = parseInt(quantityChange, 10);
    if (isNaN(change) || change === 0) {
      setError('Please enter a valid, non-zero quantity change.');
      return;
    }

    bulkAdjustStock(productIds, change, reason);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all";
  const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Bulk Adjustment</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            {/* Selected Products */}
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Adjusting {selectedProducts.length} products
              </p>
              <div className="max-h-28 overflow-y-auto bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg space-y-1">
                {selectedProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <Package size={12} className="text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300 truncate">{p.name}</span>
                    <span className="text-xs text-slate-400 ml-auto">({p.quantity})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Change */}
            <div>
              <label htmlFor="quantityChange" className={labelClass}>Quantity Change</label>
              <input
                type="number"
                id="quantityChange"
                value={quantityChange}
                onChange={(e) => setQuantityChange(e.target.value)}
                required
                placeholder="e.g., 10 or -5"
                className={inputClass}
              />
              <p className="text-xs text-slate-400 mt-1">Positive to add, negative to remove</p>
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className={labelClass}>Reason</label>
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
              Apply Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkStockAdjustmentModal;
