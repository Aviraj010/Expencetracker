import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiHome,
  FiTrendingUp,
  FiTrendingDown,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
} from 'react-icons/fi';
import iconImg from '../assets/icon.png';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    toast.success(`${newTheme === 'dark' ? '🌙 Dark' : '☀️ Light'} mode activated`, {
      duration: 2000,
    });
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/income', label: 'Income', icon: FiTrendingUp },
    { path: '/expense', label: 'Expenses', icon: FiTrendingDown },
    { path: '/profile', label: 'Profile', icon: FiUser },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully', {
      duration: 2000,
    });
    setTimeout(() => navigate('/auth'), 500);
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Navbar - Only visible on small screens */}
      <div className="navbar bg-base-100 shadow-lg lg:hidden fixed top-0 left-0 right-0 z-40">
        <div className="flex-1">
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <FiMenu className="text-2xl" />
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="avatar">
              <div className="w-8 h-8 rounded-full">
                <img src={iconImg} alt="Logo" />
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-primary">EXPENSE</span>
              <span className="text-xs font-bold text-secondary">TRACKER</span>
            </div>
          </div>
        </div>
        <div className="flex-none">
          {/* Theme Toggle - Mobile */}
          <button
            className="btn btn-ghost btn-circle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <FiMoon className="text-xl" />
            ) : (
              <FiSun className="text-xl" />
            )}
          </button>
        </div>
      </div>

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-base-200 z-50 
          transition-transform duration-300 ease-in-out
          w-64 flex flex-col shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={iconImg} alt="Expense Tracker Logo" />
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-primary">EXPENSE</span>
              <span className="text-sm font-bold text-secondary">TRACKER</span>
            </div>
          </div>
          {/* Close button - Only visible on mobile */}
          <button
            className="btn btn-ghost btn-sm btn-circle lg:hidden"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="menu menu-md gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    className={`
                      flex items-center gap-3 rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? 'bg-primary text-primary-content font-semibold shadow-md'
                          : 'hover:bg-base-300'
                      }
                    `}
                  >
                    <Icon className="text-xl" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-base-300 space-y-2">
          {/* Theme Toggle - Desktop */}
          <button
            className="btn btn-outline btn-block justify-start gap-3"
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <>
                <FiMoon className="text-xl" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <FiSun className="text-xl" />
                <span>Light Mode</span>
              </>
            )}
          </button>

          {/* Logout Button */}
          <button
            className="btn btn-error btn-block justify-start gap-3"
            onClick={handleLogout}
          >
            <FiLogOut className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Spacer for mobile navbar */}
      <div className="h-16 lg:hidden"></div>
    </>
  );
}