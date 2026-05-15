import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function ChangePassword() {
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/user/password', passwordData);
      alert('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '' });
      navigate('/profile');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div>
      <h1 className="page-title">Change Password</h1>
      
      <div className="brutalist-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Update Your Security</h2>
        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Current Password</label>
            <input 
              type="password" 
              className="brutalist-input" 
              value={passwordData.currentPassword} 
              onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} 
              required 
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>New Password</label>
            <input 
              type="password" 
              className="brutalist-input" 
              value={passwordData.newPassword} 
              onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
              required 
              minLength="8"
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              className="brutalist-button" 
              style={{ flex: 1, background: 'var(--white)', color: 'var(--text-dark)' }}
              onClick={() => navigate('/profile')}
            >
              CANCEL
            </button>
            <button type="submit" className="brutalist-button accent" style={{ flex: 2 }}>
              UPDATE PASSWORD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
