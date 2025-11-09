import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Check if current path is login or register
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Glass Header */}
      <div 
        className={`glass-header ${scrolled ? 'scrolled' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 999,
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease'
        }}
      >
        <Container>
          <Navbar expand="lg" className="py-3" style={{ backgroundColor: 'transparent' }}>
            <Navbar.Brand 
              as={Link} 
              to="/" 
              style={{ 
                color: '#000000', 
                fontWeight: '700',
                fontSize: '1.4rem',
                textDecoration: 'none',
                fontFamily: 'Poppins, sans-serif',
                letterSpacing: '0.5px'
              }}
            >
              Campus Issue Reporter
            </Navbar.Brand>
            <Navbar.Toggle 
              aria-controls="basic-navbar-nav" 
              style={{
                borderColor: 'rgba(0, 0, 0, 0.2)',
                backgroundColor: 'rgba(0, 0, 0, 0.05)'
              }}
            />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mx-auto">
                {/* Navigation items - only show after login and not on auth pages */}
                {user && !isAuthPage && (
                  <>
                    <Nav.Link 
                      as={Link} 
                      to="/reports" 
                      className="nav-link-glass"
                      style={{ 
                        color: '#000000', 
                        fontWeight: '500',
                        fontFamily: 'Poppins, sans-serif',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        margin: '0 5px',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(128, 172, 194, 0.2)';
                        e.target.style.color = '#FFFFFF';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(128, 172, 194, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#000000';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <span className="nav-link-text">
                        <i className="fas fa-clipboard-list me-2"></i>
                        Reports
                      </span>
                    </Nav.Link>
                    <Nav.Link 
                      as={Link} 
                      to="/report-form" 
                      className="nav-link-glass"
                      style={{ 
                        color: '#000000', 
                        fontWeight: '500',
                        fontFamily: 'Poppins, sans-serif',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        margin: '0 5px',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(128, 172, 194, 0.2)';
                        e.target.style.color = '#FFFFFF';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(128, 172, 194, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#000000';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <span className="nav-link-text">
                        <i className="fas fa-plus-circle me-2"></i>
                        New Report
                      </span>
                    </Nav.Link>
                    <Nav.Link 
                      as={Link} 
                      to={
                        user.role === 'user' ? '/user-dashboard' :
                        user.role === 'maintainer' ? '/maintainer-dashboard' :
                        user.role === 'fieldhead' || user.role === 'field_head' ? '/fieldhead-dashboard' : '/'
                      } 
                      className="nav-link-glass"
                      style={{ 
                        color: '#000000', 
                        fontWeight: '500',
                        fontFamily: 'Poppins, sans-serif',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        margin: '0 5px',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(128, 172, 194, 0.2)';
                        e.target.style.color = '#FFFFFF';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(128, 172, 194, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#000000';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <span className="nav-link-text">
                        <i className="fas fa-tachometer-alt me-2"></i>
                        Dashboard
                      </span>
                    </Nav.Link>
                  </>
                )}
              </Nav>
              <Nav>
                {user ? (
                  <div className="d-flex align-items-center">
                    <span 
                      className="username-text"
                      style={{
                        color: '#000000',
                        fontWeight: '500',
                        fontFamily: 'Poppins, sans-serif',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        marginRight: '15px'
                      }}
                    >
                      {user.name}
                    </span>
                    <Button 
                      variant="outline-dark" 
                      onClick={handleLogout}
                      className="logout-btn"
                      style={{
                        borderColor: 'rgba(0, 0, 0, 0.3)',
                        color: '#000000',
                        fontWeight: '500',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(128, 172, 194, 0.1)';
                        e.target.style.borderColor = 'rgba(128, 172, 194, 0.4)';
                        e.target.style.color = '#FFFFFF';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(128, 172, 194, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.3)';
                        e.target.style.color = '#000000';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <span className="button-text">
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout
                      </span>
                    </Button>
                  </div>
                ) : (
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-dark" 
                      as={Link}
                      to="/login"
                      className="auth-btn"
                      style={{
                        borderColor: 'rgba(0, 0, 0, 0.3)',
                        color: '#000000',
                        fontWeight: '500',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(128, 172, 194, 0.1)';
                        e.target.style.borderColor = 'rgba(128, 172, 194, 0.4)';
                        e.target.style.color = '#FFFFFF';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(128, 172, 194, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.3)';
                        e.target.style.color = '#000000';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <span className="button-text">
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Login
                      </span>
                    </Button>
                    <Button 
                      variant="outline-dark" 
                      as={Link}
                      to="/register"
                      className="auth-btn"
                      style={{
                        borderColor: 'rgba(0, 0, 0, 0.3)',
                        color: '#000000',
                        fontWeight: '500',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(128, 172, 194, 0.1)';
                        e.target.style.borderColor = 'rgba(128, 172, 194, 0.4)';
                        e.target.style.color = '#FFFFFF';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(128, 172, 194, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.3)';
                        e.target.style.color = '#000000';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <span className="button-text">
                        <i className="fas fa-user-plus me-2"></i>
                        Register
                      </span>
                    </Button>
                  </div>
                )}
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </Container>
      </div>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div style={{ height: '80px' }}></div>

      <style jsx>{`
        .nav-link-glass {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .nav-link-text {
          position: relative;
          z-index: 1;
        }
        
        .nav-link-glass::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(128, 172, 194, 0.2), transparent);
          transition: left 0.5s ease;
          z-index: 0;
        }
        
        .nav-link-glass:hover {
          background-color: rgba(128, 172, 194, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(128, 172, 194, 0.2);
        }
        
        .nav-link-glass:hover::before {
          left: 100%;
        }
        
        .username-text {
          transition: all 0.3s ease;
        }
        
        .logout-btn {
          position: relative;
          overflow: hidden;
        }
        
        .auth-btn {
          position: relative;
          overflow: hidden;
        }
        
        .button-text {
          position: relative;
          z-index: 1;
        }
        
        .button-text::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
          z-index: 0;
        }
        
        .logout-btn:hover .button-text::before {
          left: 100%;
        }
        
        .auth-btn:hover .button-text::before {
          left: 100%;
        }
        
        .glass-header.scrolled {
          background-color: 'rgba(255, 255, 255, 0.6)';
          backdrop-filter: 'blur(15px)';
          -webkit-backdrop-filter: 'blur(15px)';
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </>
  );
};

export default Header;