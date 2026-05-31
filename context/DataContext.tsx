
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Product, Supplier, AuditLog, Transaction, TransactionType, PurchaseOrder, POStatus, User, Role } from '../types';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';

interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

interface DataContextType {
  products: Product[];
  suppliers: Supplier[];
  auditLogs: AuditLog[];
  transactions: Transaction[];
  purchaseOrders: PurchaseOrder[];
  users: User[];
  categories: string[];
  isLoading: boolean;
  toastMessage: ToastMessage | null;
  clearToastMessage: () => void;
  addCategory: (categoryName: string) => Promise<boolean>;
  addUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addSupplier: (supplierData: Omit<Supplier, 'id' | 'created_at'>) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (supplierId: number) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'last_updated' | 'created_at'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  getSupplierName: (supplierId: number) => string;
  adjustStock: (productId: number, newQuantity: number, reason: string) => Promise<void>;
  bulkAdjustStock: (productIds: number[], quantityChange: number, reason: string) => Promise<void>;
  recordSale: (items: { product_id: number; quantity: number; price_per_unit: number }[]) => Promise<void>;
  recordPurchase: (items: { product_id: number; quantity: number; cost: number }[]) => Promise<void>;
  addPurchaseOrder: (poData: Omit<PurchaseOrder, 'id' | 'status' | 'created_at' | 'updated_at' | 'total_cost'>) => Promise<void>;
  updatePurchaseOrderStatus: (poId: number, status: POStatus) => Promise<void>;
  sendLowStockAlerts: () => Promise<string>;
}

export const DataContext = createContext<DataContextType | null>(null);

interface DataProviderProps {
  children: ReactNode;
}

// Mock user for audit logs (fallback when no auth is available)
const MOCK_USER = { id: 'dev-admin-001', name: 'Admin User' };

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  
  // Get the current authenticated user
  const { user: authUser } = useAuth();

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, suppliersRes, auditLogsRes, transactionsRes, purchaseOrdersRes, usersRes] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: false }),
          supabase.from('suppliers').select('*').order('name'),
          supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
          supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100),
          supabase.from('purchase_orders').select('*').order('created_at', { ascending: false }),
          supabase.from('profiles').select('*'),
        ]);

        if (productsRes.error) throw productsRes.error;
        // FIX: Explicitly cast products data to ensure correct typing for downstream operations like setting categories.
        const productsData: Product[] = productsRes.data || [];
        setProducts(productsData);
        setCategories([...new Set(productsData.map(p => p.category))].sort());

        if (suppliersRes.error) throw suppliersRes.error;
        setSuppliers(suppliersRes.data);

        if (auditLogsRes.error) throw auditLogsRes.error;
        setAuditLogs(auditLogsRes.data);

        if (transactionsRes.error) throw transactionsRes.error;
        setTransactions(transactionsRes.data);

        if (purchaseOrdersRes.error) throw purchaseOrdersRes.error;
        setPurchaseOrders(purchaseOrdersRes.data);

        if (usersRes.error) throw usersRes.error;
        // FIX: Explicitly map user properties from 'profiles' to the User type.
        // This prevents errors if a user's full_name is null and ensures data consistency.
        const mappedUsers = usersRes.data.map((u: any) => ({
          id: u.id,
          name: u.full_name || u.email || 'User',
          role: u.role as Role,
          username: u.email || '',
          notifications_enabled: u.notifications_enabled,
          email: u.email,
          phone: u.phone,
        })) as User[];
        setUsers(mappedUsers);

      } catch (error: any) {
        // FIX: More robust error message handling to avoid showing "[object Object]".
        let errorMessage = "An unknown error occurred.";
        if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = String(error.message);
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        setToastMessage({ message: `Data fetching error: ${errorMessage}`, type: 'error' });
        console.error("Data fetching error:", error);
      } finally {
        setIsLoading(false);
        // Optionally handle expired products automatically if configured
        try {
          const autoHandle = (import.meta as any).env?.VITE_HANDLE_EXPIRED === 'true';
          if (autoHandle) {
            // run in background, don't block UI
            handleExpiredProducts(true).then((count) => {
              if (count && count > 0) {
                setToastMessage({ message: `${count} expired product(s) processed automatically.`, type: 'success' });
              }
            }).catch(err => console.error('Auto-expiration failed:', err));
          }
        } catch (e) {
          console.error('Auto-expiration check error', e);
        }
      }
    };

    // Always fetch data (no auth check)
    fetchAllData();
  }, []);

  const clearToastMessage = () => setToastMessage(null);

  const addLog = async (action: string, targetName: string, details: string) => {
    const userId = authUser?.id || MOCK_USER.id;
    const userName = authUser?.name || MOCK_USER.name;
    
    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId,
      user_name: userName,
      action,
      target_name: targetName,
      details,
    });
    if (error) setToastMessage({ message: `Failed to log action: ${error.message}`, type: 'error' });
  };

  const addCategory = async (categoryName: string): Promise<boolean> => {
    // Note: Categories are derived from products, so adding a category is implicit
    // when a product with a new category is added. This function is for explicit management if needed.
    const trimmedName = categoryName.trim();
    if (trimmedName && !categories.find(c => c.toLowerCase() === trimmedName.toLowerCase())) {
      setCategories(prev => [...prev, trimmedName].sort());
      await addLog('Created Category', trimmedName, `New category "${trimmedName}" added.`);
      setToastMessage({ message: `Category "${trimmedName}" available for use.`, type: 'success' });
      return true;
    }
    setToastMessage({ message: `Category "${trimmedName}" already exists.`, type: 'error' });
    return false;
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    // This now requires creating an auth user and a profile.
    // Simplified: We assume user creation is handled via Supabase Auth UI / signup.
    // This function now only handles profile updates.
    setToastMessage({ message: `User creation should be handled via Supabase Signup.`, type: 'error' });
  };

  const updateUser = async (updatedUser: User) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updatedUser.name,
        role: updatedUser.role,
        notifications_enabled: updatedUser.notifications_enabled,
        email: updatedUser.email,
        phone: updatedUser.phone
      })
      .eq('id', updatedUser.id);

    if (error) {
      setToastMessage({ message: `Failed to update user: ${error.message}`, type: 'error' });
    } else {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      await addLog('Updated User', updatedUser.name, `Details updated for user ${updatedUser.username}`);
      setToastMessage({ message: `User "${updatedUser.name}" updated.`, type: 'success' });
    }
  };

  const deleteUser = async (userId: string) => {
    // Attempt safe deletion flow:
    // 1. If server-side admin endpoint is configured, call it.
    // 2. Otherwise attempt to remove the profile row (may be blocked by RLS).
    const adminApi = (import.meta as any).env?.VITE_ADMIN_API_URL;

    // Helper for local state update and logging
    const finalizeLocalDeletion = async (deletedUser?: User) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
      if (deletedUser) await addLog('Deleted User', deletedUser.name, `User ${deletedUser.username} deleted.`);
      setToastMessage({ message: `User removed.`, type: 'success' });
    };

    try {
      // If admin endpoint provided, prefer it (secure, uses service role key server-side)
      if (adminApi) {
        const resp = await fetch(`${adminApi.replace(/\/$/, '')}/delete-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId }),
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || 'Admin API deletion failed');
        }

        // Remove locally
        const deletedUser = users.find(u => u.id === userId);
        await finalizeLocalDeletion(deletedUser);
        return;
      }

      // Fallback: try deleting profile row directly (may be denied by RLS)
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) {
        throw error;
      }

      const deletedUser = users.find(u => u.id === userId);
      await finalizeLocalDeletion(deletedUser);
    } catch (error: any) {
      const message = error?.message || String(error) || 'Could not delete user. Configure an admin API for secure deletion.';
      setToastMessage({ message: `User deletion failed: ${message}`, type: 'error' });
      console.error('User deletion failed:', error);
    }
  };

  // Handle expired products: set quantity to 0, record adjustment transaction, and log
  const handleExpiredProducts = async (autoApply = false) => {
    try {
      const nowIso = new Date().toISOString();
      const expired = products.filter(p => p.expiration_date && new Date(p.expiration_date) < new Date() && p.quantity > 0);
      if (expired.length === 0) return 0;

      for (const p of expired) {
        // If not autoApply, skip making changes and only return count
        if (!autoApply) continue;

        // Update product quantity to 0
        const { error: updErr } = await supabase.from('products').update({ quantity: 0, last_updated: new Date().toISOString() }).eq('id', p.id);
        if (updErr) {
          console.error('Failed to mark expired product:', p.id, updErr);
          continue;
        }

        // Insert transaction adjustment
        const { error: txErr } = await supabase.from('transactions').insert({
          product_id: p.id,
          type: TransactionType.Adjustment,
          quantity_change: -p.quantity,
          notes: 'Expired - auto removed',
          user: authUser?.name || MOCK_USER.name,
          date: new Date().toISOString()
        });
        if (txErr) console.error('Failed to log expired adjustment:', txErr);

        await addLog('Expired Product', p.name, `Expired and removed ${p.quantity} units`);
      }

      // Refresh local products & transactions
      const { data: refreshedProducts } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (refreshedProducts) setProducts(refreshedProducts as Product[]);

      const { data: refreshedTransactions } = await supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100);
      if (refreshedTransactions) setTransactions(refreshedTransactions as Transaction[]);

      return expired.length;
    } catch (err) {
      console.error('handleExpiredProducts error:', err);
      return 0;
    }
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('suppliers').insert(supplierData).select().single();
    if (error) {
      setToastMessage({ message: `Failed to add supplier: ${error.message}`, type: 'error' });
    } else {
      setSuppliers(prev => [data, ...prev]);
      await addLog('Created Supplier', data.name, `New supplier added.`);
      setToastMessage({ message: `Supplier "${data.name}" added.`, type: 'success' });
    }
  };

  const updateSupplier = async (updatedSupplier: Supplier) => {
    const { error } = await supabase.from('suppliers').update({ name: updatedSupplier.name }).eq('id', updatedSupplier.id);
    if (error) {
      setToastMessage({ message: `Failed to update supplier: ${error.message}`, type: 'error' });
    } else {
      setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
      await addLog('Updated Supplier', updatedSupplier.name, `Supplier details updated.`);
      setToastMessage({ message: `Supplier "${updatedSupplier.name}" updated.`, type: 'success' });
    }
  };

  const deleteSupplier = async (supplierId: number) => {
    const supplierToDelete = suppliers.find(s => s.id === supplierId);
    if (!supplierToDelete) return;
    const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
    if (error) {
      setToastMessage({ message: `Failed to delete supplier: ${error.message}`, type: 'error' });
    } else {
      setSuppliers(prev => prev.filter(s => s.id !== supplierId));
      await addLog('Deleted Supplier', supplierToDelete.name, `Supplier removed.`);
      setToastMessage({ message: `Supplier "${supplierToDelete.name}" deleted.`, type: 'success' });
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'last_updated' | 'created_at'>) => {
    const { data, error } = await supabase.from('products').insert(productData).select().single();
    if (error) {
      setToastMessage({ message: `Failed to add product: ${error.message}`, type: 'error' });
    } else {
      setProducts(prev => [data, ...prev]);
      await addLog('Created Product', data.name, `Initial stock: ${data.quantity}`);
      setToastMessage({ message: `Product "${data.name}" created.`, type: 'success' });
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    const { id, ...updateData } = updatedProduct;
    const { error } = await supabase.from('products').update(updateData).eq('id', id);
    if (error) {
      setToastMessage({ message: `Failed to update product: ${error.message}`, type: 'error' });
    } else {
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      await addLog('Updated Product', updatedProduct.name, `Product details updated.`);
      setToastMessage({ message: `Product "${updatedProduct.name}" updated.`, type: 'success' });
    }
  };

  const deleteProduct = async (productId: number) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      setToastMessage({ message: `Failed to delete product: ${error.message}`, type: 'error' });
    } else {
      setProducts(prev => prev.filter(p => p.id !== productId));
      await addLog('Deleted Product', productToDelete.name, `Product SKU ${productToDelete.sku} removed.`);
      setToastMessage({ message: `Product "${productToDelete.name}" deleted.`, type: 'success' });
    }
  };

  const adjustStock = async (productId: number, newQuantity: number, reason: string) => {
    // This will now be part of a more robust RPC call if needed, but for simple adjustment:
    const originalProduct = products.find(p => p.id === productId);
    if (!originalProduct) {
      setToastMessage({ message: `Product with ID ${productId} not found`, type: 'error' });
      return;
    }

    if (newQuantity < 0) {
      setToastMessage({ message: `Invalid quantity: cannot be negative`, type: 'error' });
      return;
    }

    const quantity_change = newQuantity - originalProduct.quantity;

    const { error: productUpdateError } = await supabase.from('products').update({ quantity: newQuantity, last_updated: new Date().toISOString() }).eq('id', productId);
    if (productUpdateError) {
      setToastMessage({ message: `Failed to adjust stock: ${productUpdateError.message}`, type: 'error' });
      return;
    }

    setProducts(products.map(p => p.id === productId ? { ...p, quantity: newQuantity, last_updated: new Date().toISOString() } : p));

    const { error: transactionError } = await supabase.from('transactions').insert({
      product_id: productId,
      type: TransactionType.Adjustment,
      quantity_change,
      notes: reason,
      user: authUser?.name || MOCK_USER.name,
      date: new Date().toISOString()
    });

    if (transactionError) {
      setToastMessage({ message: `Stock updated, but failed to log transaction: ${transactionError.message}`, type: 'error' });
    } else {
      // Re-fetch transactions to reflect the new adjustment
      const { data: newTransactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);
      if (!fetchError && newTransactions) {
        setTransactions(newTransactions);
      }

      await addLog('Stock Adjustment', originalProduct.name, `Quantity changed from ${originalProduct.quantity} to ${newQuantity}. Reason: ${reason}`);
      setToastMessage({ message: `Stock for "${originalProduct.name}" adjusted.`, type: 'success' });
    }
  };

  const recordSale = async (items: { product_id: number; quantity: number; price_per_unit: number }[]) => {
    const userName = authUser?.name || MOCK_USER.name;
    try {
      // Validate items and get current product data
      const validatedItems = [];
      for (const item of items) {
        const product = products.find(p => p.id === item.product_id);
        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }
        if (item.quantity <= 0) {
          throw new Error(`Invalid quantity for product ${product.name}`);
        }
        if (item.quantity > product.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
        }
        validatedItems.push({ ...item, currentQuantity: product.quantity });
      }

      // Update products and insert transactions manually
      for (const item of validatedItems) {
        const newQuantity = item.currentQuantity - item.quantity;
        
        // Update product quantity
        const { error: productError } = await supabase
          .from('products')
          .update({ quantity: newQuantity, last_updated: new Date().toISOString() })
          .eq('id', item.product_id);
        if (productError) throw productError;

        // Insert transaction
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            product_id: item.product_id,
            type: TransactionType.Sale,
            quantity_change: -item.quantity,
            price_per_unit: item.price_per_unit,
            notes: 'Sale transaction',
            user: userName,
            date: new Date().toISOString()
          });
        if (transactionError) throw transactionError;
      }

      // Update local products state
      let tempProducts = [...products];
      validatedItems.forEach(item => {
        tempProducts = tempProducts.map(p => p.id === item.product_id ? { ...p, quantity: p.quantity - item.quantity, last_updated: new Date().toISOString() } : p);
      });
      setProducts(tempProducts);

      // Re-fetch transactions to ensure consistency
      const { data: newTransactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);
      if (!fetchError && newTransactions) {
        setTransactions(newTransactions);
      }

      setToastMessage({ message: 'Sale recorded successfully!', type: 'success' });
    } catch (error: any) {
      setToastMessage({ message: `Sale failed: ${error.message}`, type: 'error' });
    }
  };

  const recordPurchase = async (items: { product_id: number; quantity: number; cost: number }[]) => {
    const userName = authUser?.name || MOCK_USER.name;
    try {
      // Validate items and get current product data
      const validatedItems = [];
      for (const item of items) {
        const product = products.find(p => p.id === item.product_id);
        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }
        if (item.quantity <= 0) {
          throw new Error(`Invalid quantity for product`);
        }
        if (item.cost <= 0) {
          throw new Error(`Invalid cost for product`);
        }
        validatedItems.push({ ...item, currentQuantity: product.quantity });
      }

      // Update products and insert transactions manually
      for (const item of validatedItems) {
        const newQuantity = item.currentQuantity + item.quantity;
        
        // Update product quantity and cost
        const { error: productError } = await supabase
          .from('products')
          .update({ quantity: newQuantity, cost: item.cost, last_updated: new Date().toISOString() })
          .eq('id', item.product_id);
        if (productError) throw productError;

        // Insert transaction
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            product_id: item.product_id,
            type: TransactionType.Purchase,
            quantity_change: item.quantity,
            price_per_unit: item.cost,
            notes: 'Purchase transaction',
            user: userName,
            date: new Date().toISOString()
          });
        if (transactionError) throw transactionError;
      }

      // Update local products state
      let tempProducts = [...products];
      validatedItems.forEach(item => {
        tempProducts = tempProducts.map(p => p.id === item.product_id ? { ...p, quantity: p.quantity + item.quantity, cost: item.cost, last_updated: new Date().toISOString() } : p);
      });
      setProducts(tempProducts);

      // Re-fetch transactions to ensure consistency
      const { data: newTransactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);
      if (!fetchError && newTransactions) {
        setTransactions(newTransactions);
      }

      setToastMessage({ message: 'Purchase recorded and stock updated.', type: 'success' });
    } catch (error: any) {
      setToastMessage({ message: `Purchase failed: ${error.message}`, type: 'error' });
    }
  };

  const getSupplierName = (supplierId: number) => {
    return suppliers.find(s => s.id === supplierId)?.name || 'Unknown Supplier';
  };

  // --- Placeholder functions for features not fully implemented with backend logic yet ---
  const bulkAdjustStock = async (productIds: number[], quantityChange: number, reason: string) => {
    setToastMessage({ message: 'Bulk adjustment via RPC not implemented in this version. Each item adjusted individually.', type: 'error' });
    // This should be an RPC call in a real app.
    for (const id of productIds) {
      const product = products.find(p => p.id === id);
      if (product) {
        await adjustStock(id, product.quantity + quantityChange, `Bulk: ${reason}`);
      }
    }
  };

  const addPurchaseOrder = async (poData: Omit<PurchaseOrder, 'id' | 'status' | 'created_at' | 'updated_at' | 'total_cost'>) => {
    const total_cost = poData.items.reduce((sum, item) => sum + item.quantity * item.cost, 0);
    const { data, error } = await supabase.from('purchase_orders').insert({ ...poData, total_cost }).select().single();
    if (error) {
      setToastMessage({ message: `Failed to create PO: ${error.message}`, type: 'error' });
    } else {
      setPurchaseOrders(prev => [data, ...prev]);
      await addLog('Created PO', `PO #${data.id}`, `Supplier: ${getSupplierName(data.supplier_id)}, Total: GHS ${total_cost.toFixed(2)}`);
      setToastMessage({ message: `Purchase Order #${data.id} created.`, type: 'success' });
    }
  };

  const updatePurchaseOrderStatus = async (poId: number, status: POStatus) => {
    const poToUpdate = purchaseOrders.find(po => po.id === poId);
    if (!poToUpdate) return;

    const { error } = await supabase.from('purchase_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', poId);

    if (error) {
      setToastMessage({ message: `Failed to update PO status: ${error.message}`, type: 'error' });
    } else {
      setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, status, updated_at: new Date().toISOString() } : po));
      await addLog('Updated PO Status', `PO #${poId}`, `Status changed to ${status}`);
      setToastMessage({ message: `PO #${poId} status updated to ${status}.`, type: 'success' });

      if (status === POStatus.Received) {
        await recordPurchase(poToUpdate.items.map(i => ({ product_id: i.product_id, quantity: i.quantity, cost: i.cost })));
        await addLog('Received PO', `PO #${poId}`, `Stock levels updated automatically.`);
      }
    }
  };

  const sendLowStockAlerts = async (): Promise<string> => {
    // This logic remains client-side for the demo. In a real app, this would be a serverless function.
    const lowStockProducts = products.filter(p => p.quantity <= p.low_stock_threshold);
    if (lowStockProducts.length === 0) {
      setToastMessage({ message: "No products are currently low on stock.", type: 'success' });
      return "No products are currently low on stock.";
    }
    // Users are now fetched from 'profiles' table which doesn't have password info
    const usersToNotify = users.filter(u => u.notifications_enabled && (u.role === Role.Admin || u.role === Role.Manager));

    if (usersToNotify.length === 0) {
      const msg = "Low stock items detected, but no users are configured to receive alerts.";
      setToastMessage({ message: msg, type: 'error' });
      return msg;
    }

    const msg = `Alerts sent to ${usersToNotify.length} user(s) for ${lowStockProducts.length} low-stock product(s). (Simulated)`;
    setToastMessage({ message: msg, type: 'success' });
    return msg;
  };


  return (
    <DataContext.Provider value={{ products, suppliers, auditLogs, transactions, purchaseOrders, users, categories, isLoading, toastMessage, clearToastMessage, addCategory, addUser, updateUser, deleteUser, addSupplier, updateSupplier, deleteSupplier, addProduct, updateProduct, deleteProduct, getSupplierName, adjustStock, bulkAdjustStock, recordSale, recordPurchase, addPurchaseOrder, updatePurchaseOrderStatus, sendLowStockAlerts }}>
      {children}
    </DataContext.Provider>
  );
};
