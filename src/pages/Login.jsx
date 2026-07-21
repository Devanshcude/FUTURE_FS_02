import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Shield, LineChart, Layers3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.message
        || (err?.request
          ? 'Unable to reach the authentication server. Make sure the backend is running.'
          : 'Login failed. Please try again.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ email: 'admin@crm.com', password: 'admin123' });
    setErrors({});
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-slate-900/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden overflow-hidden rounded-[2rem] border border-border/70 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] lg:flex lg:flex-col">
            <div className="flex-1 p-10 xl:p-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-white/70">
                <Sparkles size={14} />
                Premium CRM Workspace
              </div>
              <h1 className="mt-8 max-w-xl text-5xl font-semibold tracking-tight xl:text-6xl">
                A cleaner way to manage every relationship.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/68">
                Built for sales teams that want the visual calm of Apple and the system clarity of Samsung.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Shield, title: 'Secure access', text: 'Protected admin sessions and JWT auth.' },
                  { icon: Layers3, title: 'Unified workflow', text: 'Leads, notes, and follow-ups in one flow.' },
                  { icon: LineChart, title: 'Instant insight', text: 'Charts and lists tuned for quick decisions.' },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                    <Icon size={18} className="text-accent" />
                    <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/64">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 p-6 xl:p-8">
              <div className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/6 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-white">Lead management</p>
                  <p className="text-xs text-white/55">Fast, refined, and admin-focused.</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-lg">
                  <Sparkles size={22} />
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-xl animate-slide-up">
              <div className="mb-6 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white px-4 py-2 shadow-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark text-white">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-text-faint">CRM Studio</p>
                    <p className="text-xs text-text-muted">Lead management system</p>
                  </div>
                </div>
                <p className="hidden text-xs text-text-faint sm:block">Admin sign in</p>
              </div>

              <div className="glass-card p-6 sm:p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-semibold tracking-tight text-text-primary">Welcome back</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">
                    Sign in to continue to the premium CRM workspace.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-muted">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="admin@crm.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`input-field pl-9 ${errors.email ? 'input-field-error' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-muted">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`input-field pl-9 pr-10 ${errors.password ? 'input-field-error' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2 py-3"
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 rounded-2xl border border-accent/15 bg-accent/5 p-4">
            <p className="mb-2 text-center text-xs text-text-muted">
              Demo credentials
            </p>
            <button
              onClick={fillDemo}
              className="w-full text-center text-xs font-medium text-accent transition-colors hover:text-accent-hover"
            >
              admin@crm.com / admin123
            </button>
          </div>
              </div>

              <p className="mt-6 text-center text-xs text-text-faint">
                CRM Studio v1.0 · Professional lead management
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
