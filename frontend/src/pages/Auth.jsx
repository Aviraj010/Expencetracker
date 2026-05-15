import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import iconImg from '../assets/icon.png';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/user/login' : '/user/register';
      const { data } = await api.post(endpoint, formData);
      if(data.token) {
        localStorage.setItem('token', data.token);
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication Failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="brutalist-card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <img src={iconImg} alt="Expense Tracker Logo" className="logo-image" style={{ width: '60px', height: '60px', marginBottom: '0.8rem' }} />
          <h2 style={{ margin: 0, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '-0.5px' }}>Expense Tracker</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            style={{ flex: 1, padding: '0.5rem', background: isLogin ? 'var(--primary)' : 'transparent', color: isLogin ? 'white' : 'black', fontWeight: 'bold', border: 'none', borderBottom: isLogin ? '3px solid black' : 'none', cursor: 'pointer' }}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            style={{ flex: 1, padding: '0.5rem', background: !isLogin ? 'var(--primary)' : 'transparent', color: !isLogin ? 'white' : 'black', fontWeight: 'bold', border: 'none', borderBottom: !isLogin ? '3px solid black' : 'none', cursor: 'pointer' }}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!isLogin && (
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Name</label>
              <input type="text" className="brutalist-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required={!isLogin} />
            </div>
          )}
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input type="email" className="brutalist-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input type="password" className="brutalist-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
          <button type="submit" className="brutalist-button" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
}
