import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
      <Navbar.Brand as={Link} to="/">Campus Issue Reporter</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {user && (
            <>
              <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
              <Nav.Link as={Link} to="/report-form">New Report</Nav.Link>
              {user.role === 'user' && <Nav.Link as={Link} to="/user-dashboard">Dashboard</Nav.Link>}
              {user.role === 'maintainer' && <Nav.Link as={Link} to="/maintainer-dashboard">Dashboard</Nav.Link>}
              {user.role === 'fieldhead' && <Nav.Link as={Link} to="/fieldhead-dashboard">Dashboard</Nav.Link>}
              {user.role === 'field_head' && (
                <>
                  <Nav.Link as={Link} to="/all-reports">All Reports</Nav.Link>
                  <Nav.Link as={Link} to="/history">History</Nav.Link>
                </>
              )}
            </>
          )}
        </Nav>
        <Nav>
          {user ? (
            <>
              <Navbar.Text className="me-3">
                Welcome, {user.name}
              </Navbar.Text>
              <Button variant="outline-light" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/register">Register</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
