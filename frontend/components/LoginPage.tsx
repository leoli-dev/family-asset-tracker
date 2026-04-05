import React, { useState } from 'react';
import { PiggyBank, KeyRound, LogIn } from 'lucide-react';
import { verifyToken, setToken } from '../services/api';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [token, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError('');
    try {
      const ok = await verifyToken(token.trim());
      if (ok) {
        setToken(token.trim());
        onLogin();
      } else {
        setError('Invalid access token.');
      }
    } catch {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mb-4">
            <PiggyBank size={36} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Family Asset Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your access token to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5"
        >
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <KeyRound size={15} />
              Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="Paste your token here"
              autoFocus
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition font-mono text-sm bg-white"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <LogIn size={18} />
            {loading ? 'Verifying…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
