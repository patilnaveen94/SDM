import React, { useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { enableDemoMode, isAdminLoggedIn, isDemoModeEnabled, adminLogout } from '../store/dataStore';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { label: 'Gear', path: '/admin/gear', icon: '🎥' },
  { label: 'Inventory', path: '/admin/inventory', icon: '📦' },
  { label: 'Orders', path: '/admin/orders', icon: '📋' },
  { label: 'Reports', path: '/admin/reports', icon: '📈' },
  { label: 'Updates', path: '/admin/updates', icon: '📢' },
  { label: 'Media', path: '/admin/media', icon: '🖼️' },
  { label: 'Partners', path: '/admin/partners', icon: '🤝' },
  { label: 'View Site', path: '/', icon: '🌐' },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const demoMode = isDemoModeEnabled();

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogout = () => { adminLogout(); navigate('/admin'); };
  const handleDemoModeToggle = () => {
    enableDemoMode(!demoMode);
    window.location.reload();
  };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-white/5">
        <h1 className="text-lg font-heading font-bold text-gold">SDM Admin</h1>
        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Management Panel</p>
      </div>
      <div className={`mx-3 mt-3 rounded-xl border p-3 ${demoMode ? 'border-blue-400/20 bg-blue-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
        <p className={`text-xs font-semibold ${demoMode ? 'text-blue-300' : 'text-gray-300'}`}>
          {demoMode ? 'Demo data is active' : 'Live browser data'}
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-gray-500">
          {demoMode ? 'Changes stay separate from your business records.' : 'Demo data is stored separately and will not replace live records.'}
        </p>
        <button
          onClick={handleDemoModeToggle}
          className="mt-2 w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-white/5"
        >
          {demoMode ? 'Switch to live data' : 'Switch to demo data'}
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive && item.path !== '/' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/5">
        <button onClick={handleLogout} className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 border border-white/5 transition-all">
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-dark-surface/95 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close admin navigation' : 'Open admin navigation'}
          aria-controls="admin-navigation"
          aria-expanded={sidebarOpen}
          className="p-2 rounded-lg hover:bg-white/5"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`h-px w-full bg-white transition-all ${sidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`h-px w-full bg-white transition-all ${sidebarOpen ? 'opacity-0' : ''}`} />
            <span className={`h-px w-full bg-white transition-all ${sidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
        <span className="text-sm font-heading font-bold text-gold">
          SDM Admin{demoMode && <span className="ml-1 text-[9px] text-blue-300">DEMO</span>}
        </span>
        <button onClick={handleLogout} className="text-xs text-gray-400">Logout</button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-obsidian/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside id="admin-navigation" className={`fixed top-0 left-0 h-full w-64 bg-dark-surface border-r border-white/5 flex flex-col z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-h-screen overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};
