import React, { useState } from 'react';
import { Form, Button, Alert, Card, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Login = () => {
  const [collegeId, setCollegeId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted || loading) return; // Prevent multiple submissions

    setError('');
    setMessage('');
    setLoading(true);
    setSubmitted(true);

    try {
      const response = await api.post('/auth/login', { collegeId, password, role });
      login(response.data.token, response.data.user);
      setMessage('Login successful');
      setLoading(false);
      // Redirect will be handled by the AuthContext
    } catch (error) {
      const status = error.response?.status;
      if (status === 404 || status === 401) {
        setError(error.response?.data?.error || 'Invalid credentials');
        setSubmitted(false); // Allow retry only for auth errors
      } else {
        setError(error.response?.data?.error || 'Failed to login');
        setSubmitted(false); // Allow retry for other errors
      }
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            
              <Form onSubmit={handleSubmit}>
                <Form.Group id="collegeId" className="mb-3">
                  <Form.Label>College ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    required
                    placeholder="Enter your college ID"
                  />
                </Form.Group>
                <Form.Group id="password" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </Form.Group>
                <Form.Group id="role" className="mb-3">
                  <Form.Label>Login as</Form.Label>
                  <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="user">User</option>
                    <option value="maintainer">Maintainer</option>
                    <option value="field_head">Field Head</option>
                  </Form.Select>
                </Form.Group>
                <Button disabled={loading} className="w-100" type="submit">
                  Login
                </Button>
              </Form>
            
            <div className="w-100 text-center mt-3">
              <Link to="/register">Need an account? Register</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Login;