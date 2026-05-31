
import React, { useState, useEffect } from 'react';
import { DataProvider, DataContext } from './context/DataContext';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import Reports from './components/Reports';
import AuditLog from './components/AuditLog';
import PurchaseOrders from './components/PurchaseOrders';
import ProductDetail from './components/ProductDetail';
import PurchaseOrderDetail from './components/PurchaseOrderDetail';
import UserManagement from './components/UserManagement';
import Suppliers from './components/Suppliers';
import StaffDashboard from './components/staff/StaffDashboard';
import StaffProductList from './components/staff/StaffProductList';
import StaffHistory from './components/staff/StaffHistory';
import StaffProfile from './components/staff/StaffProfile';
import Toast from './components/Toast';
import { Page, SearchResult, Transaction, Role } from './types';

// =====================================================
// ROLE-BASED ACCESS CONTROL CONFIGURATION
// =====================================================

// Define which pages each role can access
const ROLE_PERMISSIONS: Record<Role, Page[]> = {
  [Role.Admin]: [
    'dashboard', 'products', 'purchaseOrders', 'suppliers', 'reports',
    'audit', 'users', 'productDetail', 'purchaseOrderDetail'
  ],
  [Role.Manager]: [
    'dashboard', 'products', 'purchaseOrders', 'suppliers', 'reports',
    'audit', 'productDetail', 'purchaseOrderDetail'
  ],
  [Role.Staff]: [
    'staffDashboard', 'staffProducts', 'staffHistory', 'staffProfile', 'productDetail'
  ]
};

// Define default landing page for each role
const DEFAULT_PAGE: Record<Role, Page> = {
  [Role.Admin]: 'dashboard',
  [Role.Manager]: 'dashboard',
  [Role.Staff]: 'staffDashboard'
};

// Check if a role can access a page
const canAccessPage = (role: Role, page: Page): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(page) ?? false;
};

// Get the appropriate redirect page for unauthorized access
const getRedirectPage = (role: Role): Page => {
  return DEFAULT_PAGE[role] || 'dashboard';
};

// =====================================================
// APP CONTENT COMPONENT
// =====================================================

const AppContent: React.FC = () => {
  const { user, loading, login, logout } = useAuth();
  const dataContext = React.useContext(DataContext);

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [activePurchaseOrderId, setActivePurchaseOrderId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // =====================================================
  // ROLE-BASED ROUTING MIDDLEWARE
  // =====================================================

  // Set initial page based on user role
  useEffect(() => {
    if (user) {
      const defaultPage = getRedirectPage(user.role);
      setCurrentPage(defaultPage);
    }
  }, [user?.id]); // Only run when user changes (login/logout)

  // Secure page navigation - prevents unauthorized access
  const secureSetCurrentPage = (page: Page) => {
    if (!user) return;

    // Check if user has permission to access the requested page
    if (canAccessPage(user.role, page)) {
      setCurrentPage(page);
    } else {
      // Redirect to their default page if unauthorized
      console.warn(`Access denied: ${user.role} cannot access ${page}. Redirecting...`);
      setCurrentPage(getRedirectPage(user.role));
    }
  };

  // Validate current page on user change
  useEffect(() => {
    if (user && !canAccessPage(user.role, currentPage)) {
      setCurrentPage(getRedirectPage(user.role));
    }
  }, [user, currentPage]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login onLogin={login} />;
  }

  // Show loading if data not ready
  if (!dataContext) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading data...</p>
        </div>
      </div>
    );
  }

  const { toastMessage, clearToastMessage, products, suppliers, transactions } = dataContext;

  const viewProduct = (productId: number) => {
    setActiveProductId(productId);
    secureSetCurrentPage('productDetail');
    clearSearch();
  };

  const viewPurchaseOrder = (poId: number) => {
    setActivePurchaseOrderId(poId);
    secureSetCurrentPage('purchaseOrderDetail');
    clearSearch();
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();

    const productResults: SearchResult[] = products
      .filter(p => p.name.toLowerCase().includes(lowerCaseQuery) || p.sku.toLowerCase().includes(lowerCaseQuery))
      .map(p => ({
        type: 'product',
        id: p.id,
        title: p.name,
        subtitle: `SKU: ${p.sku}`,
        original_object: p
      }));

    const supplierResults: SearchResult[] = suppliers
      .filter(s => s.name.toLowerCase().includes(lowerCaseQuery))
      .map(s => ({
        type: 'supplier',
        id: s.id,
        title: s.name,
        subtitle: 'Supplier',
        original_object: s
      }));

    const transactionResults: SearchResult[] = transactions
      .filter(t => {
        const product = products.find(p => p.id === t.product_id);
        return product && product.name.toLowerCase().includes(lowerCaseQuery);
      })
      .slice(0, 5)
      .map(t => {
        const product = products.find(p => p.id === t.product_id)!;
        return {
          type: 'transaction',
          id: t.id,
          title: `${t.type} for ${product.name}`,
          subtitle: `Qty: ${t.quantity_change} on ${new Date(t.date).toLocaleDateString()}`,
          original_object: t
        }
      });

    setSearchResults([...productResults, ...supplierResults, ...transactionResults].slice(0, 10));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'product':
        viewProduct(result.id);
        break;
      case 'supplier':
        secureSetCurrentPage('suppliers');
        clearSearch();
        break;
      case 'transaction':
        const transaction = result.original_object as Transaction;
        viewProduct(transaction.product_id);
        break;
    }
  };

  // =====================================================
  // ROLE-BASED PAGE RENDERING
  // =====================================================
  const renderPage = () => {
    // Double-check authorization before rendering
    if (!canAccessPage(user.role, currentPage)) {
      const redirectPage = getRedirectPage(user.role);
      return renderPageContent(redirectPage);
    }
    return renderPageContent(currentPage);
  };

  const renderPageContent = (page: Page) => {
    switch (page) {
      // Admin/Manager pages
      case 'dashboard':
        return <Dashboard setCurrentPage={secureSetCurrentPage} />;
      case 'products':
        return <ProductList viewProduct={viewProduct} />;
      case 'purchaseOrders':
        return <PurchaseOrders viewPurchaseOrder={viewPurchaseOrder} />;
      case 'suppliers':
        return <Suppliers />;
      case 'reports':
        return <Reports />;
      case 'audit':
        return <AuditLog />;
      case 'users':
        return <UserManagement />;
      case 'productDetail':
        return activeProductId ? (
          <ProductDetail
            productId={activeProductId}
            setCurrentPage={secureSetCurrentPage}
            backPage={user.role === Role.Staff ? 'staffProducts' : 'products'}
          />
        ) : (
          user.role === Role.Staff
            ? <StaffProductList viewProduct={viewProduct} />
            : <ProductList viewProduct={viewProduct} />
        );
      case 'purchaseOrderDetail':
        return activePurchaseOrderId ? (
          <PurchaseOrderDetail purchaseOrderId={activePurchaseOrderId} setCurrentPage={secureSetCurrentPage} />
        ) : (
          <PurchaseOrders viewPurchaseOrder={viewPurchaseOrder} />
        );

      // Staff pages
      case 'staffDashboard':
        return <StaffDashboard setCurrentPage={secureSetCurrentPage} />;
      case 'staffProducts':
        return <StaffProductList viewProduct={viewProduct} />;
      case 'staffHistory':
        return <StaffHistory />;
      case 'staffProfile':
        return <StaffProfile setCurrentPage={secureSetCurrentPage} />;

      // Fallback - should never reach here due to middleware
      default:
        return <Dashboard setCurrentPage={secureSetCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={clearToastMessage}
        />
      )}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={secureSetCurrentPage}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        user={user}
        onLogout={logout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          setIsSidebarOpen={setIsSidebarOpen}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchResults={searchResults}
          onResultClick={handleSearchResultClick}
          isSearchFocused={isSearchFocused}
          setIsSearchFocused={setIsSearchFocused}
          clearSearch={clearSearch}
          user={user}
        />
        <main
          onClick={() => isSearchFocused && clearSearch()}
          className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8"
        >
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
