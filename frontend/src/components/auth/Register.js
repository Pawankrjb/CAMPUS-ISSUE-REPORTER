import React, { useState } from 'react';
import { Form, Button, Alert, Card, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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
  const { login } = useAuth();

  const { collegeId, password, name, role, department } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      login(response.data.token, response.data.user);
      setMessage('Registration successful');
      // Redirect will be handled by the AuthContext
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Register</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            
              <Form onSubmit={handleSubmit}>
                <Form.Group id="collegeId" className="mb-3">
                  <Form.Label>College ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="collegeId"
                    value={collegeId}
                    onChange={onChange}
                    required
                    placeholder="Enter your college ID"
                  />
                </Form.Group>

                <Form.Group id="password" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                    placeholder="Enter your password"
                  />
                </Form.Group>

                <Form.Group id="name" className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                  />
                </Form.Group>

                <Form.Group id="role" className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select name="role" value={role} onChange={onChange}>
                    <option value="user">User (Reporter)</option>
                    <option value="maintainer">Maintainer</option>
                    <option value="field_head">Field Head (Department Head)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group id="department" className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select name="department" value={department} onChange={onChange} required>
                    <option value="">Select Department</option>
                    <option value="road">Road</option>
                    <option value="electric">Electric</option>
                    <option value="water">Water</option>
                    <option value="building">Building</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Button disabled={loading} className="w-100" type="submit">
                  Register
                </Button>
              </Form>
            
            <div className="w-100 text-center mt-3">
              <Link to="/login">Already have an account? Login</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Register;