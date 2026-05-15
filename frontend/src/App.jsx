import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';

function Layout({ children }) {
  const isAuthenticated = !!localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/income" element={<Layout><Income /></Layout>} />
        <Route path="/expense" element={<Layout><Expense /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/change-password" element={<Layout><ChangePassword /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;