import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { MdLogout } from 'react-icons/md';

export default function Profile() {
  const [user, setUser] = useState({ name: '', email: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user/me');
        if (response.data.success) {
          setUser({ name: response.data.user.name, email: response.data.user.email });
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/user/profile', user);
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };





  return (
    <div>
      <h1 className="page-title">Profile & Settings</h1>

      <div className="grid-2">
        {/* Profile Update Form */}
        <div className="brutalist-card">
          <h2 style={{ marginBottom: '1.5rem' }}>Update Profile</h2>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Name</label>
              <input 
                type="text" 
                className="brutalist-input" 
                value={user.name} 
                onChange={e => setUser({...user, name: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <input 
                type="email" 
                className="brutalist-input" 
                value={user.email} 
                onChange={e => setUser({...user, email: e.target.value})} 
                required 
              />
            </div>
            <button type="submit" className="brutalist-button">SAVE PROFILE</button>
          </form>
        </div>

        {/* Password Update Navigation */}
        <div className="brutalist-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Account Security</h2>
          <p style={{ marginBottom: '1.5rem' }}>Keep your account secure by updating your password regularly.</p>
          <button 
            className="brutalist-button accent" 
            onClick={() => navigate('/change-password')}
          >
            CHANGE PASSWORD
          </button>
        </div>
      </div>


    </div>
  );
}
