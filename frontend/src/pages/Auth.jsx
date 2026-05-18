import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import iconImg from '../assets/icon.png';
import { toast } from 'react-hot-toast';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from 'react-icons/fi';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
    });
    setErrors({});
    setShowPassword(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend Validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/user/login' : '/user/register';

      const { data } = await api.post(endpoint, formData);

      // Only login if token exists
      if (data?.token) {
        localStorage.setItem('token', data.token);
        toast.success(
          isLogin ? 'Welcome back!' : 'Account created successfully!',
          {
            duration: 3000,
            position: 'top-right',
          }
        );
        setTimeout(() => navigate('/'), 500);
      } else {
        toast.error(data?.message || 'Authentication Failed', {
          duration: 4000,
          position: 'top-right',
        });
      }
    } catch (err) {
      console.log(err);

      const message =
        err.response?.data?.message || err.message || 'Authentication Failed';

      toast.error(message, {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = (loginMode) => {
    setIsLogin(loginMode);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Auth Card */}
      <div className="card w-full max-w-md bg-base-100 shadow-2xl relative z-10 transition-all duration-300 hover:shadow-3xl">
        <div className="card-body p-8">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-6 animate-fade-in">
            <div className="avatar mb-4">
              <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={iconImg} alt="Expense Tracker Logo" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Expense Tracker
            </h2>
            <p className="text-sm text-base-content/60 mt-2">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="tabs tabs-boxed bg-base-200 p-1 mb-6">
            <button
              type="button"
              className={`tab flex-1 transition-all duration-300 ${
                isLogin ? 'tab-active' : ''
              }`}
              onClick={() => toggleAuthMode(true)}
            >
              Login
            </button>
            <button
              type="button"
              className={`tab flex-1 transition-all duration-300 ${
                !isLogin ? 'tab-active' : ''
              }`}
              onClick={() => toggleAuthMode(false)}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field - Only for Register */}
            {!isLogin && (
              <div className="form-control animate-slide-in">
                <label className="label">
                  <span className="label-text font-medium">Name</span>
                </label>
                <label className="input input-bordered flex items-center gap-2 focus-within:input-primary transition-all">
                  <FiUser className="text-base-content/40" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    className="grow"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </label>
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.name}
                    </span>
                  </label>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="form-control ">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <label className="input input-bordered flex items-center gap-2 focus-within:input-primary transition-all">
                <FiMail className="text-base-content/40" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="grow"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </label>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.email}
                  </span>
                </label>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control ">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2 focus-within:input-primary transition-all">
                <FiLock className="text-base-content/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  className="grow"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FiEyeOff className="text-base-content/60" />
                  ) : (
                    <FiEye className="text-base-content/60" />
                  )}
                </button>
              </label>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password}
                  </span>
                </label>
              )}
              {!isLogin && !errors.password && (
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Must be at least 8 characters
                  </span>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`btn btn-primary w-full mt-6 ${
                isLoading ? 'btn-disabled' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : isLogin ? (
                'Login'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer Text */}
          <div className="divider text-xs text-base-content/40">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm w-full"
            onClick={() => toggleAuthMode(!isLogin)}
          >
            {isLogin ? 'Create one now' : 'Login instead'}
          </button>
        </div>
      </div>
    </div>
  );
}