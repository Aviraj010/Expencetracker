import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  TrendingUp,
  User,
  WalletCards,
} from 'lucide-react';
import api from '../utils/api';
import iconImg from '../assets/icon.png';

const emptyForm = { name: '', email: '', password: '' };

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Authentication failed';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(emptyForm);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setErrors({});
    setShowPassword(false);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!isLogin && !formData.name.trim()) nextErrors.name = 'Name is required';
    if (!formData.email.trim()) nextErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email';
    }
    if (!formData.password) nextErrors.password = 'Password is required';
    else if (formData.password.length < 8) {
      nextErrors.password = 'Minimum 8 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const endpoint = isLogin ? '/user/login' : '/user/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;
      const { data } = await api.post(endpoint, payload);

      if (!data?.token) {
        throw new Error(data?.message || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      toast.success(isLogin ? 'Welcome back.' : 'Account created.');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    resetForm();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-200 p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--p)/0.12),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--s)/0.10),transparent_30%)]" />

      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-base-300 bg-base-100/90 shadow-2xl backdrop-blur-xl lg:grid-cols-[1fr_28rem]">
        <div className="hidden border-r border-base-300 bg-base-200/50 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                <img src={iconImg} alt="Expense Tracker" className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl font-black">Expense Tracker</h1>
                <p className="text-sm text-base-content/60">Finance workspace</p>
              </div>
            </div>

            <h2 className="max-w-md text-4xl font-black leading-tight">
              Manage income and expenses with clarity.
            </h2>
            <p className="mt-4 max-w-sm text-base-content/60">
              A focused dashboard for tracking money, categories, and monthly activity.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              ['Track cashflow', TrendingUp],
              ['Secure account', ShieldCheck],
              ['Organized records', WalletCards],
            ].map(([label, Icon]) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-4"
              >
                <Icon className="text-primary" size={20} />
                <span className="font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-base-300 bg-base-100 shadow-sm">
              <img src={iconImg} alt="Expense Tracker" className="h-9 w-9" />
            </div>
            <h1 className="text-2xl font-black">Expense Tracker</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="mt-1 text-sm text-base-content/60">
              {isLogin ? 'Sign in to continue.' : 'Start tracking your finances.'}
            </p>
          </div>

          <div className="tabs tabs-boxed mb-6 bg-base-200 p-1">
            <button
              type="button"
              className={`tab flex-1 ${isLogin ? 'tab-active' : ''}`}
              onClick={() => switchMode(true)}
            >
              Login
            </button>
            <button
              type="button"
              className={`tab flex-1 ${!isLogin ? 'tab-active' : ''}`}
              onClick={() => switchMode(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="label" htmlFor="name">
                  <span className="label-text font-medium">Name</span>
                </label>
                <label className={`input input-bordered flex items-center gap-2 ${errors.name ? 'input-error' : ''}`}>
                  <User size={17} className="text-base-content/40" />
                  <input
                    id="name"
                    name="name"
                    className="grow"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </label>
                {errors.name && <p className="mt-2 text-sm text-error">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="label" htmlFor="email">
                <span className="label-text font-medium">Email</span>
              </label>
              <label className={`input input-bordered flex items-center gap-2 ${errors.email ? 'input-error' : ''}`}>
                <Mail size={17} className="text-base-content/40" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="grow"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </label>
              {errors.email && <p className="mt-2 text-sm text-error">{errors.email}</p>}
            </div>

            <div>
              <label className="label" htmlFor="password">
                <span className="label-text font-medium">Password</span>
              </label>
              <label className={`input input-bordered flex items-center gap-2 ${errors.password ? 'input-error' : ''}`}>
                <Lock size={17} className="text-base-content/40" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="grow"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>
              {errors.password && (
                <p className="mt-2 text-sm text-error">{errors.password}</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary mt-4 w-full gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? 'Login' : 'Create Account'}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="divider text-xs text-base-content/40">
            {isLogin ? 'New here?' : 'Already registered?'}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm w-full"
            onClick={() => switchMode(!isLogin)}
            disabled={isLoading}
          >
            {isLogin ? 'Create an account' : 'Login instead'}
          </button>
        </div>
      </section>
    </main>
  );
}
