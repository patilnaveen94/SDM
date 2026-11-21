import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, isAdminLoggedIn } from '../store/dataStore';
import { hasAdminPasswordSetupSession, setAdminPassword } from '../store/backend';
import { ThemeToggle } from '../components/ThemeToggle';

export const AdminLogin: React.FC = () => {
  const [setupPassword, setSetupPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    hasAdminPasswordSetupSession()
      .then(hasSession => {
        if (!active) return;
        if (hasSession) {
          setSetupPassword(true);
        } else if (isAdminLoggedIn()) {
          navigate('/admin/dashboard', { replace: true });
        }
      })
      .catch(sessionError => {
        if (active) setError(sessionError instanceof Error ? sessionError.message : 'Unable to verify the invitation link.');
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (setupPassword) {
        if (password.length < 8) {
          setError('Use a password with at least 8 characters.');
          return;
        }
        if (password !== confirmPassword) {
          setError('The passwords do not match.');
          return;
        }
        await setAdminPassword(password);
        navigate('/admin/dashboard');
        return;
      }

      const result = await adminLogin(email.trim(), password);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.message || 'Unable to sign in.');
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-shell min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-5 flex justify-end">
          <ThemeToggle />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold text-white">SDM Admin</h1>
          <p className="text-gray-500 text-sm mt-2">
            {setupPassword ? 'Create a password to finish setting up your administrator account' : 'Sign in to manage your business'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          {!setupPassword && (
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Admin email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
                autoFocus
                autoComplete="username"
                required
              />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
              {setupPassword ? 'Create password (minimum 8 characters)' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
              autoComplete={setupPassword ? 'new-password' : 'current-password'}
              required
            />
          </div>
          {setupPassword && (
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold focus:outline-none transition-colors"
                autoComplete="new-password"
                required
              />
            </div>
          )}
          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-gold text-obsidian font-bold hover:bg-gold-light transition-colors disabled:cursor-wait disabled:opacity-70">
            {submitting ? (setupPassword ? 'Saving password…' : 'Signing in…') : (setupPassword ? 'Set Password' : 'Sign In')}
          </button>
        </form>
      </div>
    </div>
  );
};
