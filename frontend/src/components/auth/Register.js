import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './ModernAuth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    collegeId: '',
    password: '',
    name: '',
    role: 'user',
    department: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { login } = useAuth();

  const { collegeId, password, name, role, department } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted || loading) return;

    setError('');
    setMessage('');
    setLoading(true);
    setSubmitted(true);

    try {
      const response = await api.post('/auth/register', formData);
      login(response.data.token, response.data.user);
      setMessage('Registration successful');
      setLoading(false);
      // Redirect will be handled by AuthContext
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to register');
      setSubmitted(false);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Section - Campus Animation */}
      <div className="left-section">
        <h1 className="campus-title">Join Our Community</h1>
        <p className="campus-subtitle">Help improve your campus by reporting issues and tracking their resolution</p>
        
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
              <i className="fas fa-shield-alt"></i>
            </div>
            <span>Secure</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-users"></i>
            </div>
            <span>Community</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-bell"></i>
            </div>
            <span>Updates</span>
          </div>
        </div>
      </div>

      {/* Right Section - Register Form */}
      <div className="right-section">
        <div className="auth-form">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join our community to report campus issues</p>
          
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="collegeId" className="form-label">College ID</label>
              <input
                id="collegeId"
                name="collegeId"
                type="text"
                value={collegeId}
                onChange={onChange}
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={onChange}
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
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={onChange}
                required
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role" className="form-label">Role</label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={onChange}
                className="form-input form-select"
              >
                <option value="user">User (Reporter)</option>
                <option value="maintainer">Maintainer</option>
                <option value="field_head">Field Head (Department Head)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="department" className="form-label">Department</label>
              <select
                id="department"
                name="department"
                value={department}
                onChange={onChange}
                required
                className="form-input form-select"
              >
                <option value="">Select Department</option>
                <option value="road">Road</option>
                <option value="electric">Electric</option>
                <option value="water">Water</option>
                <option value="building">Building</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Creating account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus me-2"></i>
                  Create Account
                </>
              )}
            </button>
          </form>
          
          <div className="divider">
            <span>OR</span>
          </div>
          
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;