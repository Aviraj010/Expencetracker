import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import iconImg from '../assets/icon.png';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = isLogin ? '/user/login' : '/user/register';
      const { data } = await api.post(endpoint, formData);
      if(data.token) {
        localStorage.setItem('token', data.token);
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Inter:wght@400;500&display=swap');

        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
        }

        .auth-background {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(37, 99, 235, 0) 70%);
          top: -10%;
          left: -5%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(124, 58, 237, 0) 70%);
          bottom: -10%;
          right: -5%;
          animation-delay: 5s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(219, 39, 119, 0) 70%);
          top: 40%;
          right: 10%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.8);
          position: relative;
          z-index: 1;
          animation: cardEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo-wrapper {
          display: inline-block;
          margin-bottom: 1.5rem;
          animation: logoFloat 3s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .auth-logo {
          width: 72px;
          height: 72px;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(37, 99, 235, 0.2));
        }

        .auth-title {
          font-family: 'Sora', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .auth-subtitle {
          font-size: 0.938rem;
          color: #64748b;
          font-weight: 400;
        }

        .auth-tabs {
          display: flex;
          gap: 0.5rem;
          background: #f8fafc;
          padding: 0.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          position: relative;
        }

        .auth-tab {
          flex: 1;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-family: 'Sora', sans-serif;
          font-size: 0.938rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 2;
        }

        .auth-tab.active {
          color: #0f172a;
        }

        .auth-tab:hover {
          color: #0f172a;
        }

        .tab-indicator {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          width: calc(50% - 0.5rem);
          height: calc(100% - 1rem);
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }

        .tab-indicator.right {
          transform: translateX(calc(100% + 0.5rem));
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: both;
        }

        .form-group:nth-child(1) {
          animation-delay: 0.1s;
        }

        .form-group:nth-child(2) {
          animation-delay: 0.2s;
        }

        .form-group:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-label {
          font-family: 'Sora', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .form-input {
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 0.938rem;
          color: #0f172a;
          background: white;
          transition: all 0.2s ease;
          outline: none;
        }

        .form-input::placeholder {
          color: #94a3b8;
        }

        .form-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .form-input:hover {
          border-color: #cbd5e1;
        }

        .auth-submit {
          margin-top: 0.5rem;
          padding: 1rem;
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'Sora', sans-serif;
          font-size: 0.938rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }

        .auth-submit::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .auth-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
        }

        .auth-submit:hover::before {
          left: 100%;
        }

        .auth-submit:active {
          transform: translateY(0);
        }

        .auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
        }

        .forgot-link {
          font-size: 0.875rem;
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .forgot-link:hover {
          color: #1e40af;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 2rem 1.5rem;
          }
          
          .auth-title {
            font-size: 1.75rem;
          }
          
          .auth-logo {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-wrapper">
              <img src={iconImg} alt="Expense Tracker" className="auth-logo" />
            </div>
            <h1 className="auth-title">Expense Tracker</h1>
            <p className="auth-subtitle">Manage your finances with clarity</p>
          </div>
          
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
              type="button"
            >
              Sign In
            </button>
            <button 
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
              type="button"
            >
              Sign Up
            </button>
            <div className={`tab-indicator ${!isLogin ? 'right' : ''}`}></div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter your name"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@example.com"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Enter your password"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="auth-footer">
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}