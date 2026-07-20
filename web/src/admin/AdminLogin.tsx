import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../store/dataStore';

export const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(username, password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold text-white">SDM Admin</h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to manage your business</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
            />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-gold text-obsidian font-bold hover:bg-gold-light transition-colors">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};
