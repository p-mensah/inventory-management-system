
import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { PurchaseOrder, POStatus } from '../types';
import { Plus, Search, ClipboardList } from 'lucide-react';
import PurchaseOrderModal from './PurchaseOrderModal';

const PurchaseOrders: React.FC<{ viewPurchaseOrder: (poId: number) => void }> = ({ viewPurchaseOrder }) => {
  const { purchaseOrders, getSupplierName, updatePurchaseOrderStatus } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<POStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPOs = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return purchaseOrders.filter(po => {
      if (filter !== 'all' && po.status !== filter) return false;
      if (lowercasedSearchTerm) {
        const supplierName = getSupplierName(po.supplier_id).toLowerCase();
        const poId = po.id.toString();
        return poId.includes(lowercasedSearchTerm) || supplierName.includes(lowercasedSearchTerm);
      }
      return true;
    });
  }, [purchaseOrders, filter, searchTerm, getSupplierName]);

  const statusStyles: Record<POStatus, string> = {
    [POStatus.Pending]: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    [POStatus.Shipped]: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    [POStatus.Received]: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  };

  const statusFilters = ['all', ...Object.values(POStatus)] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Purchase Orders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and track purchase orders</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus size={16} />
          Create PO
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {statusFilters.map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by PO# or Supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filteredPOs.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No purchase orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">PO #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Updated</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredPOs.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => viewPurchaseOrder(po.id)}
                        className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        #{po.id}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{getSupplierName(po.supplier_id)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${statusStyles[po.status]}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white text-right font-medium">GHS {po.total_cost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{new Date(po.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{new Date(po.updated_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      {po.status !== POStatus.Received && (
                        <select
                          value={po.status}
                          onChange={(e) => updatePurchaseOrderStatus(po.id, e.target.value as POStatus)}
                          className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        >
                          <option value={POStatus.Pending}>Pending</option>
                          <option value={POStatus.Shipped}>Shipped</option>
                          <option value={POStatus.Received}>Received</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isModalOpen && <PurchaseOrderModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default PurchaseOrders;
