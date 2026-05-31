
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Plus, Trash2, X, ClipboardList, Package } from 'lucide-react';

interface PurchaseOrderModalProps {
  onClose: () => void;
}

const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ onClose }) => {
  const { products, suppliers, addPurchaseOrder } = useData();
  const [supplier_id, setSupplierId] = useState<number>(suppliers[0]?.id || 0);
  const [items, setItems] = useState<{ product_id: number; quantity: number; cost: number; name: string }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 0);

  const handleAddItem = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const existingItemIndex = items.findIndex(item => item.product_id === selectedProductId);

    if (existingItemIndex !== -1) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += 1;
      setItems(updatedItems);
    } else {
      setItems([...items, { product_id: product.id, quantity: 1, cost: product.cost, name: product.name }]);
    }
  };

  const handleItemChange = (productId: number, field: 'quantity' | 'cost', value: number) => {
    setItems(items.map(item => item.product_id === productId ? { ...item, [field]: Math.max(0, value) } : item));
  };

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter(item => item.product_id !== productId));
  };

  const total = items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const poItems = items.map(({ product_id, quantity, cost }) => ({ product_id, quantity, cost }));
    addPurchaseOrder({ supplier_id, items: poItems });
    onClose();
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all";
  const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create Purchase Order</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          <div className="p-4 space-y-4 flex-grow overflow-y-auto">
            {/* Supplier Selection */}
            <div>
              <label htmlFor="supplier_id" className={labelClass}>Supplier</label>
              <select id="supplier_id" value={supplier_id} onChange={(e) => setSupplierId(Number(e.target.value))} className={inputClass}>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Add Item */}
            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Add Products</p>
              <div className="flex gap-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className={`${inputClass} flex-1`}
                >
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">No items added yet</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.product_id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
                    </div>
                    <div className="w-20">
                      <label className="text-[10px] text-slate-400 uppercase">Qty</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.product_id, 'quantity', Number(e.target.value))}
                        min="1"
                        className="w-full px-2 py-1 text-sm rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] text-slate-400 uppercase">Cost (GHS)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.cost}
                        onChange={(e) => handleItemChange(item.product_id, 'cost', Number(e.target.value))}
                        min="0"
                        className="w-full px-2 py-1 text-sm rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="w-20 text-right">
                      <p className="text-[10px] text-slate-400 uppercase">Total</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">GHS {(item.quantity * item.cost).toFixed(2)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.product_id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Order Cost</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">GHS {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={items.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;
