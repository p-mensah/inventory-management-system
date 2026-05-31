
import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import SupplierModal from './SupplierModal';
import ConfirmationModal from './ConfirmationModal';
import { Supplier } from '../types';

const Suppliers: React.FC = () => {
  const { suppliers, deleteSupplier } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);

  const openModal = (supplier: Supplier | null = null) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
  };

  const openConfirmModal = (id: number) => {
    setSupplierToDelete(id);
    setIsConfirmOpen(true);
  };

  const closeConfirmModal = () => {
    setSupplierToDelete(null);
    setIsConfirmOpen(false);
  };

  const handleDelete = () => {
    if (supplierToDelete !== null) {
      deleteSupplier(supplierToDelete);
      closeConfirmModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Suppliers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your supplier database</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus size={16} />
          Add Supplier
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {suppliers.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No suppliers found</p>
            <button
              onClick={() => openModal()}
              className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              Add your first supplier
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Supplier Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">ID</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {suppliers.map(supplier => (
                    <tr key={supplier.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                            <Building2 size={14} className="text-slate-500 dark:text-slate-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{supplier.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">#{supplier.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openModal(supplier)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => openConfirmModal(supplier.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <Building2 size={18} className="text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{supplier.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">ID: #{supplier.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(supplier)}
                      className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => openConfirmModal(supplier.id)}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {isModalOpen && <SupplierModal supplier={selectedSupplier} onClose={closeModal} />}
      {isConfirmOpen && (
        <ConfirmationModal
          title="Delete Supplier"
          message="Are you sure you want to delete this supplier? This may affect products linked to it."
          onConfirm={handleDelete}
          onCancel={closeConfirmModal}
        />
      )}
    </div>
  );
};

export default Suppliers;