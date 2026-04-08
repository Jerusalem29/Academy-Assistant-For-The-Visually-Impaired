import React, { useState } from 'react';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUserEmail('');
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen">
      {!isAuthenticated ? (
        <AdminLogin onLogin={handleLogin} />
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  );
};

export default AdminPage;