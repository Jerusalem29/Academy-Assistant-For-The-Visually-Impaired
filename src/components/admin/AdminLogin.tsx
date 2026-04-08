import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaSignInAlt, FaShieldAlt, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLogin.css';

interface AdminLoginProps {
  onLogin: (email: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        setError('');
        onLogin(email); // Pass email to parent
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-icon-wrapper">
            <FaUserShield className="admin-icon" />
          </div>
          <h1>Admin Portal</h1>
          <p>Secure access for administrators only</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label><FaEnvelope /> Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="admin-form-group">
            <label><FaLock /> Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {showPassword ? '👁' : '👁'}
              </button>
            </div>
          </div>
          
          <div className="admin-credentials-hint">
            <p>🔐 Secure authentication portal</p>
          </div>
          
          {error && <div className="admin-error">{error}</div>}
          
          <button 
            type="submit" 
            className={`admin-login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Authenticating...
              </>
            ) : (
              <>
                <FaSignInAlt />
                Login to Admin
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;