export enum Role {
  Admin = 'Admin',
  Manager = 'Manager',
  Staff = 'Staff',
}

export interface User {
  id: string; // Supabase UUID
  name: string;
  role: Role;
  username: string; // Legacy, email is used for auth
  password?: string;
  notifications_enabled?: boolean;
  email?: string;
  phone?: string;
  // Enhanced auth fields
  email_verified?: boolean;
  last_login?: string;
  login_attempts?: number;
  locked_until?: string;
  avatar_url?: string;
  two_factor_enabled?: boolean;
  // Session tracking
  session_login_time?: string;
}

export interface Supplier {
  id: number;
  name: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  supplier_id: number;
  cost: number;
  price: number;
  quantity: number;
  low_stock_threshold: number;
  last_updated: string;
  expiration_date?: string;
  created_at: string;
}

export enum TransactionType {
  Sale = 'Sale',
  Purchase = 'Purchase',
  Adjustment = 'Adjustment'
}

export interface Transaction {
  id: number;
  product_id: number;
  type: TransactionType;
  quantity_change: number;
  price_per_unit?: number; // Price for sale or cost for purchase
  date: string;
  notes?: string;
  user?: string;
}

export interface AuditLog {
  id: number;
  user_id: string;
  user_name: string;
  action: string;
  target_name: string;
  details: string;
  created_at: string;
}

export enum POStatus {
  Pending = 'Pending',
  Shipped = 'Shipped',
  Received = 'Received'
}

export interface PurchaseOrderItem {
  product_id: number;
  quantity: number;
  cost: number;
}

export interface PurchaseOrder {
  id: number;
  supplier_id: number;
  items: PurchaseOrderItem[];
  status: POStatus;
  total_cost: number;
  created_at: string;
  updated_at: string;
}


export type Page = 'dashboard' | 'products' | 'purchaseOrders' | 'reports' | 'audit' | 'productDetail' | 'users' | 'purchaseOrderDetail' | 'suppliers' | 'staffDashboard' | 'staffProducts' | 'staffHistory' | 'staffProfile';

export interface SearchResult {
  type: 'product' | 'supplier' | 'transaction';
  id: number;
  title: string;
  subtitle: string;
  original_object: Product | Supplier | Transaction;
}
