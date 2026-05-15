import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdMenu, MdClose } from 'react-icons/md';
import iconImg from '../assets/icon.png';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/income', label: 'Income' },
    { path: '/expense', label: 'Expenses' },
    { path: '/profile', label: 'Profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <>
      <div className="mobile-topbar">
        <div className="logo-container">
          <img src={iconImg} alt="Expense Tracker Logo" className="logo-image" />
          <div className="logo-text">
            <span className="logo-text-top">EXPENSE</span>
            <span className="logo-text-bottom">TRACKER</span>
          </div>
        </div>
        <button className="hamburger-btn" onClick={() => setIsOpen(true)}>
          <MdMenu />
        </button>
      </div>

      {isOpen && <div className="sidebar-backdrop" onClick={() => setIsOpen(false)}></div>}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={iconImg} alt="Expense Tracker Logo" className="logo-image" />
            <div className="logo-text">
              <span className="logo-text-top">EXPENSE</span>
              <span className="logo-text-bottom">TRACKER</span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <MdClose />
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link 
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : 'inactive'}`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          <button 
            className="sidebar-link inactive" 
            onClick={handleLogout} 
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              cursor: 'pointer',
              border: '3px solid transparent',
              background: 'transparent',
              color: 'white',
              textAlign: 'left',
              fontFamily: 'inherit',
              fontSize: '0.9rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = 'black';
              e.currentTarget.style.border = '3px solid black';
              e.currentTarget.style.boxShadow = '2px 2px 0px black';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.border = '3px solid transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Logout
          </button>
        </nav>
      </div>
    </>
  );
}
