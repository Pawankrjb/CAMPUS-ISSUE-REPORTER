import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './ModernAuth.css';

const Login = () => {
  const [collegeId, setCollegeId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted || loading) return;

    setError('');
    setMessage('');
    setLoading(true);
    setSubmitted(true);

    try {
      const response = await api.post('/auth/login', { collegeId, password, role });
      login(response.data.token, response.data.user);
      setMessage('Login successful');
      setLoading(false);
      // Redirect will be handled by AuthContext
    } catch (error) {
      const status = error.response?.status;
      if (status === 404 || status === 401) {
        setError(error.response?.data?.error || 'Invalid credentials');
        setSubmitted(false);
      } else {
        setError(error.response?.data?.error || 'Failed to login');
        setSubmitted(false);
      }
      setLoading(false);
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="auth-container">
      {/* Left Section - Campus Animation */}
      <div className="left-section">
        <h1 className="campus-title">Campus Issue Reporter</h1>
        <p className="campus-subtitle">A smart, digital way to report and manage campus problems efficiently</p>
        
        <div className="campus-animation">
          {/* Buildings */}
          <div className="building building-1">
            <div className="window" style={{ top: '20px', left: '15px', width: '15px', height: '15px' }}></div>
            <div className="window" style={{ top: '20px', right: '15px', width: '15px', height: '15px' }}></div>
            <div className="window" style={{ top: '50px', left: '15px', width: '15px', height: '15px' }}></div>
            <div className="window" style={{ top: '50px', right: '15px', width: '15px', height: '15px' }}></div>
            <div className="window" style={{ top: '80px', left: '15px', width: '15px', height: '15px' }}></div>
            <div className="window" style={{ top: '80px', right: '15px', width: '15px', height: '15px' }}></div>
          </div>
          
          <div className="building building-2">
            <div className="window" style={{ top: '20px', left: '20px', width: '20px', height: '20px' }}></div>
            <div className="window" style={{ top: '20px', right: '20px', width: '20px', height: '20px' }}></div>
            <div className="window" style={{ top: '60px', left: '20px', width: '20px', height: '20px' }}></div>
            <div className="window" style={{ top: '60px', right: '20px', width: '20px', height: '20px' }}></div>
            <div className="window" style={{ top: '100px', left: '20px', width: '20px', height: '20px' }}></div>
            <div className="window" style={{ top: '100px', right: '20px', width: '20px', height: '20px' }}></div>
            <div className="window" style={{ top: '140px', left: '20px', width: '20px', height: '20px' }}></div>
            <div className="window" style={{ top: '140px', right: '20px', width: '20px', height: '20px' }}></div>
          </div>
          
          <div className="building building-3">
            <div className="window" style={{ top: '20px', left: '15px', width: '15px', height: '15px' }}></div>
            <div className="window" style={{ top: '20px', right: '15px', width: '15px', height: '15px' }}></div>
            <div className="window" style={{ top: '50px', left: '15px', width: '15px', height: '15px' }}></div>
            <div className="window" style={{ top: '50px', right: '15px', width: '15px', height: '15px' }}></div>
            <div className="window" style={{ top: '80px', left: '15px', width: '15px', height: '15px' }}></div>
            <div className="window" style={{ top: '80px', right: '15px', width: '15px', height: '15px' }}></div>
          </div>
          
          {/* Trees */}
          <div className="tree tree-1">
            <div className="tree-trunk"></div>
            <div className="tree-leaves"></div>
          </div>
          
          <div className="tree tree-2">
            <div className="tree-trunk"></div>
            <div className="tree-leaves"></div>
          </div>
          
          {/* Ground */}
          <div className="ground"></div>
          
          {/* Issues */}
          <div className="issue issue-1"></div>
          <div className="issue issue-2"></div>
          <div className="issue issue-3"></div>
          
          {/* Report Icons */}
          <div className="report-icon report-icon-1">
            <i className="fas fa-exclamation" style={{ color: '#ff6b6b' }}></i>
          </div>
          <div className="report-icon report-icon-2">
            <i className="fas fa-bug" style={{ color: '#ff6b6b' }}></i>
          </div>
          <div className="report-icon report-icon-3">
            <i className="fas fa-tools" style={{ color: '#ff6b6b' }}></i>
          </div>
        </div>
        
        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-bug"></i>
            </div>
            <span>Report Issues</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <span>Track Progress</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-comments"></i>
            </div>
            <span>Get Updates</span>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="right-section">
        <div className="auth-form">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to report and track campus issues</p>
          
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="collegeId" className="form-label">College ID</label>
              <input
                id="collegeId"
                type="text"
                value={collegeId}
                onChange={handleInputChange(setCollegeId)}
                required
                className="form-input"
                placeholder="Enter your college ID"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  required
                  className="form-input"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#657786'
                  }}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="role" className="form-label">Login As</label>
              <select
                id="role"
                value={role}
                onChange={handleInputChange(setRole)}
                className="form-input form-select"
              >
                <option value="user">User</option>
                <option value="maintainer">Maintainer</option>
                <option value="field_head">Field Head</option>
              </select>
            </div>
            
            <div className="checkbox-group">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="checkbox-input"
              />
              <label htmlFor="remember-me" className="checkbox-label">Remember me</label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="divider">
            <span>OR</span>
          </div>
          
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;