
import React, { useRef } from 'react';
import { Role, Page, User } from '../types';
import {
  LayoutDashboard,
  Package,
  BarChart3,
  History,
  LogOut,
  ClipboardList,
  Users,
  Building2,
  X,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import Logo from './Logo';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  user: User;
  onLogout: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, active, onClick }) => (
  <li>
    <a
      href="#"
      onClick={e => { e.preventDefault(); onClick(); }}
      className={`
        group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
        ${active
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`${active ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'}`}>
          {icon}
        </div>
        <span className={`font-medium text-sm ${active ? 'font-semibold' : ''}`}>
          {text}
        </span>
      </div>
      {active && (
        <ChevronRight className="w-4 h-4" />
      )}
    </a>
  </li>
);

// Define navigation items for each role
const getNavItems = (role: Role) => {
  if (role === Role.Staff) {
    // Staff-only navigation
    return [
      { page: 'staffDashboard' as Page, text: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { page: 'staffProducts' as Page, text: 'Products', icon: <Package size={20} /> },
      { page: 'staffHistory' as Page, text: 'My History', icon: <History size={20} /> },
      { page: 'staffProfile' as Page, text: 'Profile', icon: <UserIcon size={20} /> },
    ];
  }

  // Admin/Manager navigation
  const navItems = [
    { page: 'dashboard' as Page, text: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { page: 'products' as Page, text: 'Products', icon: <Package size={20} /> },
    { page: 'purchaseOrders' as Page, text: 'Purchase Orders', icon: <ClipboardList size={20} /> },
    { page: 'suppliers' as Page, text: 'Suppliers', icon: <Building2 size={20} /> },
    { page: 'reports' as Page, text: 'Reports', icon: <BarChart3 size={20} /> },
    { page: 'audit' as Page, text: 'Audit Log', icon: <History size={20} /> },
  ];

  // Only Admin can access User Management
  if (role === Role.Admin) {
    navItems.push({ page: 'users' as Page, text: 'User Management', icon: <Users size={20} /> });
  }

  return navItems;
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isSidebarOpen, setIsSidebarOpen, user, onLogout }) => {
  const sidebarRef = useRef<HTMLElement>(null);

  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false);
  };

  const navItems = getNavItems(user.role);

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          no-print w-72 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
          flex flex-col fixed lg:relative inset-y-0 left-0 z-40 
          transition-transform duration-300 ease-out shadow-xl lg:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <Logo size={40} showText={true} />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-1.5">
            {navItems.map(item => (
              <NavItem
                key={item.page}
                icon={item.icon}
                text={item.text}
                active={currentPage === item.page}
                onClick={() => handleNavigation(item.page)}
              />
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-white dark:bg-slate-700/50">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.email || user.username}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-medium text-sm transition-all duration-200 group"
          >
            <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
