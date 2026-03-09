import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await api.post('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      login(response.data.access_token);
      navigate('/');
    } catch (err) {
      console.error('Login error full:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.detail || 'Error de autenticación. Verifique sus credenciales.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="bg-white w-full max-w-md p-12 text-center rounded-3xl border border-slate-200 shadow-premium animate-in fade-in zoom-in duration-500">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-primary mb-2 tracking-tight">LIMS URUFARMA</h1>
          <p className="text-sm text-secondary font-semibold uppercase tracking-wider">Control de Calidad</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div data-testid="login-error" className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-4 rounded-xl animate-shake">
              {error}
            </div>
          )}

          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <input
              data-testid="login-username"
              type="text"
              placeholder="Nombre de Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <input
              data-testid="login-password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>

          <button
            data-testid="login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Acceder al Sistema
              </>
            )}
          </button>
        </form>

        <div className="mt-16 pt-8 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">
            © 2026 Urufarma S.A.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
