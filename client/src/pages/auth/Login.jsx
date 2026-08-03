import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.success) {
        login(data.token, data.user);
        // Redirect based on role
        const dashMap = { student: '/student', teacher: '/teacher', admin: '/admin' };
        navigate(dashMap[data.user.role] || '/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-600">
        <div className="absolute inset-0 bg-hero-mesh opacity-20 mix-blend-overlay" />
        <div className="relative z-10 flex flex-col justify-between w-full p-12 lg:p-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/10">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="font-display font-bold text-white text-2xl tracking-tight">Educator</span>
          </Link>

          <div className="my-auto max-w-lg">
            <h2 className="font-display text-4xl font-semibold text-white mb-8 leading-tight">
              "The beautiful thing about learning is that no one can take it away from you."
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold backdrop-blur-sm border border-white/10">
                SJ
              </div>
              <div>
                <p className="text-white font-medium">Mr. Suresh Jayawardena</p>
                <p className="text-primary-200 text-sm">Lead Instructor, Educator</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-12 text-white">
            <div>
              <p className="text-3xl font-bold font-display">200+</p>
              <p className="text-primary-200 text-sm mt-1">Students</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-display">12+</p>
              <p className="text-primary-200 text-sm mt-1">Years Exp.</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-display">4.9★</p>
              <p className="text-primary-200 text-sm mt-1">Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex flex-col relative">
        <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
          <Link to="/" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to site
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <Link to="/" className="flex items-center gap-2 mb-12 lg:hidden">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="font-display font-bold text-slate-900 text-2xl">Educator</span>
            </Link>

            <h1 className="font-display text-3xl font-semibold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500 mb-8">Sign in to continue to your Educator account.</p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 placeholder:text-slate-400 transition-all shadow-sm"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">Password</label>
                  <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-4 pr-11 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 placeholder:text-slate-400 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer flex items-center justify-center"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                id="login-submit-btn"
                className="w-full mt-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3.5 rounded-xl transition-all shadow-md shadow-primary-600/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-8">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
