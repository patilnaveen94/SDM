import React from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { isAdminLoggedIn, adminLogout } from '../store/dataStore';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { label: 'Gear', path: '/admin/gear', icon: '🎥' },
  { label: 'Orders', path: '/admin/orders', icon: '📋' },
  { label: 'Updates', path: '/admin/updates', icon: '📢' },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogout = () => { adminLogout(); navigate('/admin'); };

  return (
    <div className="min-h-screen bg-obsidian flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-surface border-r border-white/5 flex flex-col fixed h-full">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-lg font-heading font-bold text-gold">SDM Admin</h1>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Management Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* View public site */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 mt-4 border-t border-white/5 pt-5"
          >
            <span>🌐</span>
            View Website
          </a>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 border border-white/5 transition-all">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
