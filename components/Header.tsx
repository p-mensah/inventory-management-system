
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Search, Bell, Sun, Moon, Package, Building2, TrendingUp, X, Menu, UserIcon, ShoppingCart, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { SearchResult, User, Role } from '../types';
import { useData } from '../hooks/useData';

interface HeaderProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (isFocused: boolean) => void;
  clearSearch: () => void;
  user: User;
}

// Get role badge styling
const getRoleBadgeClass = (role: Role) => {
  switch (role) {
    case Role.Admin: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    case Role.Manager: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case Role.Staff: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim() || !text) {
    return <>{text}</>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 rounded px-0.5">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

const SearchResultItem: React.FC<{ result: SearchResult; onResultClick: (result: SearchResult) => void; isHighlighted: boolean; searchQuery: string }> = ({ result, onResultClick, isHighlighted, searchQuery }) => {
  const getIcon = () => {
    switch (result.type) {
      case 'product': return <Package size={16} className="text-emerald-600 dark:text-emerald-400" />;
      case 'supplier': return <Building2 size={16} className="text-slate-600 dark:text-slate-400" />;
      case 'transaction': return <TrendingUp size={16} className="text-blue-600 dark:text-blue-400" />;
      default: return null;
    }
  };

  return (
    <li
      role="option"
      aria-selected={isHighlighted}
      onClick={() => onResultClick(result)}
      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-colors ${isHighlighted ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
        }`}
    >
      <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
          <HighlightedText text={result.title} highlight={searchQuery} />
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          <HighlightedText text={result.subtitle} highlight={searchQuery} />
        </p>
      </div>
    </li>
  );
};

const Header: React.FC<HeaderProps> = ({
  setIsSidebarOpen,
  searchQuery,
  onSearchChange,
  searchResults,
  onResultClick,
  isSearchFocused,
  setIsSearchFocused,
  clearSearch,
  user
}) => {
  const { products, transactions } = useData();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate notifications from data
  const notifications = useMemo(() => {
    const notifs: { id: string; type: 'warning' | 'info' | 'success'; title: string; message: string; time: Date }[] = [];

    // Low stock alerts
    const lowStockProducts = products.filter(p => p.quantity <= p.low_stock_threshold);
    if (lowStockProducts.length > 0) {
      notifs.push({
        id: 'low-stock',
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockProducts.length} product${lowStockProducts.length > 1 ? 's are' : ' is'} running low on stock`,
        time: new Date()
      });
    }

    // Out of stock
    const outOfStock = products.filter(p => p.quantity === 0);
    if (outOfStock.length > 0) {
      notifs.push({
        id: 'out-of-stock',
        type: 'warning',
        title: 'Out of Stock',
        message: `${outOfStock.length} product${outOfStock.length > 1 ? 's are' : ' is'} completely out of stock`,
        time: new Date()
      });
    }

    // Recent transactions (last hour)
    const recentTransactions = transactions.filter(t => {
      const transDate = new Date(t.date);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return transDate > hourAgo;
    });
    if (recentTransactions.length > 0) {
      notifs.push({
        id: 'recent-activity',
        type: 'info',
        title: 'Recent Activity',
        message: `${recentTransactions.length} transaction${recentTransactions.length > 1 ? 's' : ''} in the last hour`,
        time: new Date()
      });
    }

    return notifs;
  }, [products, transactions]);

  const notificationCount = notifications.length;

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const resultsContainerRef = useRef<HTMLUListElement>(null);

  const showResults = isSearchFocused && searchQuery.length > 1;

  useEffect(() => {
    if (showResults) {
      setHighlightedIndex(-1);
    }
  }, [searchResults, isSearchFocused, showResults]);

  useEffect(() => {
    if (highlightedIndex > -1 && resultsContainerRef.current) {
      const items = resultsContainerRef.current.querySelectorAll('[role="option"]');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      clearSearch();
      return;
    }

    if (showResults && searchResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % searchResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
      } else if (e.key === 'Enter' && highlightedIndex > -1) {
        e.preventDefault();
        onResultClick(searchResults[highlightedIndex]);
      }
    }
  };

  const getNotificationIcon = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'info': return <TrendingUp size={16} className="text-blue-500" />;
    }
  };

  return (
    <header className="no-print sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Left Section - Menu + Role Badge */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>

        {/* Role Portal Badge */}
        <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getRoleBadgeClass(user.role)}`}>
          {user.role === Role.Staff ? <ShoppingCart size={12} /> : <Users size={12} />}
          <span>{user.role} Portal</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative" onFocus={() => setIsSearchFocused(true)}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search products, suppliers..."
            className="w-40 sm:w-64 md:w-80 pl-9 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
            >
              <X size={14} />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                <ul className="p-2" ref={resultsContainerRef}>
                  {searchResults.map((result, index) => {
                    const showHeader = index === 0 || searchResults[index - 1].type !== result.type;
                    const headerText = result.type.charAt(0).toUpperCase() + result.type.slice(1) + 's';
                    return (
                      <React.Fragment key={`${result.type}-${result.id}`}>
                        {showHeader && (
                          <li className="px-3 pt-3 pb-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" aria-hidden="true">
                            {headerText}
                          </li>
                        )}
                        <SearchResultItem
                          result={result}
                          onResultClick={onResultClick}
                          isHighlighted={index === highlightedIndex}
                          searchQuery={searchQuery}
                        />
                      </React.Fragment>
                    )
                  })}
                </ul>
              ) : (
                <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                  No results found for "{searchQuery}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400 block dark:hidden group-hover:text-slate-900" />
          <Moon className="h-5 w-5 text-slate-400 dark:text-slate-300 hidden dark:block group-hover:text-slate-100" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                {notificationCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                    {notificationCount} new
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {notifications.map(notif => (
                      <div key={notif.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1.5 rounded-lg ${notif.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20' :
                              notif.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                                'bg-blue-50 dark:bg-blue-900/20'
                            }`}>
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{notif.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notif.message}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Just now</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
            <span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {user.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;