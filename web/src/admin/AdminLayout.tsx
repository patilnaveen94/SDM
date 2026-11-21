import React, { useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { isAdminLoggedIn, adminLogout } from '../store/dataStore';
import { ThemeToggle } from '../components/ThemeToggle';
import { hasLegacyStateBackup, importLegacyStateBackup } from '../store/backend';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { label: 'Gear', path: '/admin/gear', icon: '🎥' },
  { label: 'Inventory', path: '/admin/inventory', icon: '📦' },
  { label: 'Orders', path: '/admin/orders', icon: '📋' },
  { label: 'Reports', path: '/admin/reports', icon: '📈' },
  { label: 'Updates', path: '/admin/updates', icon: '📢' },
  { label: 'Testimonials', path: '/admin/testimonials', icon: '💬' },
  { label: 'Media', path: '/admin/media', icon: '🖼️' },
  { label: 'Partners', path: '/admin/partners', icon: '🤝' },
  { label: 'View Site', path: '/', icon: '🌐' },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [legacyBackupAvailable, setLegacyBackupAvailable] = useState(hasLegacyStateBackup());
  const [actionError, setActionError] = useState('');
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };
  const handleLegacyImport = async () => {
    if (!window.confirm('Import the records saved in this browser into the empty Supabase database? This cannot be undone.')) return;
    try {
      await importLegacyStateBackup();
      setLegacyBackupAvailable(false);
      window.location.reload();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to import the browser backup.');
    }
  };
  const SidebarContent = () => (
    <>
      <div className="admin-brand p-5">
        <div className="flex items-center gap-3">
          <span className="admin-brand-mark grid h-10 w-10 place-items-center rounded-xl text-lg font-bold">S</span>
          <div>
            <h1 className="text-lg font-heading font-bold text-gold">SDM Admin</h1>
            <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-gray-500">Management workspace</p>
          </div>
        </div>
      </div>
      {legacyBackupAvailable && (
        <div className="mx-3 mt-3 rounded-xl border border-amber-400/20 bg-amber-500/5 p-3">
          <p className="text-xs font-semibold text-amber-200">Browser data backup found</p>
          <p className="mt-1 text-[10px] leading-relaxed text-gray-400">The Supabase database is empty. Import the old records from this device before continuing.</p>
          <button onClick={handleLegacyImport} className="mt-2 w-full rounded-lg border border-amber-400/20 px-3 py-2 text-xs font-medium text-amber-100 hover:bg-amber-500/10">
            Import browser data
          </button>
        </div>
      )}
      <nav aria-label="Admin sections" className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `admin-nav-link flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-medium transition-all duration-300 ${
              isActive && item.path !== '/' ? 'admin-nav-active text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar-footer p-3">
        <button onClick={handleLogout} className="w-full rounded-xl border border-white/5 px-4 py-2.5 text-sm text-gray-400 transition-all hover:border-rose-400/20 hover:bg-rose-500/5 hover:text-red-400">
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-shell min-h-screen bg-obsidian">
      {/* Mobile header */}
      <div className="admin-mobile-bar lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close admin navigation' : 'Open admin navigation'}
          aria-controls="admin-navigation"
          aria-expanded={sidebarOpen}
          className="p-2 rounded-lg hover:bg-white/5"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`theme-menu-line h-px w-full bg-white transition-all ${sidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`theme-menu-line h-px w-full bg-white transition-all ${sidebarOpen ? 'opacity-0' : ''}`} />
            <span className={`theme-menu-line h-px w-full bg-white transition-all ${sidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
        <span className="text-sm font-heading font-bold text-gold">
          SDM Admin
        </span>
        <ThemeToggle compact />
        <button onClick={handleLogout} className="text-xs text-gray-400">Logout</button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-obsidian/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside id="admin-navigation" className={`admin-sidebar fixed top-0 left-0 h-full w-64 border-r border-white/5 flex flex-col z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="admin-content lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-h-screen overflow-x-hidden">
        {actionError && <p role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{actionError}</p>}
        <div className="mb-4 hidden justify-end lg:mb-5 lg:flex">
          <ThemeToggle />
        </div>
        <Outlet />
      </main>
    </div>
  );
};
