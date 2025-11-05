import React, { useState } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ReportForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'road',
    location: ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const { title, description, category, location } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = e => setImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('location', location);
      formData.append('reporterId', user._id);
      formData.append('reporterName', user.name);
      
      if (image) {
        formData.append('image', image);
      }

      await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      navigate('/user-dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '600px' }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Report an Issue</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group id="title" className="mb-3">
                <Form.Label>Issue Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={title}
                  onChange={onChange}
                  required
                />
              </Form.Group>
              
              <Form.Group id="category" className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select name="category" value={category} onChange={onChange}>
                  <option value="road">Road</option>
                  <option value="electric">Electric</option>
                  <option value="water">Water</option>
                  <option value="building">Building</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group id="location" className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={location}
                  onChange={onChange}
                  required
                  placeholder="e.g., Main Building, 2nd Floor"
                />
              </Form.Group>
              
              <Form.Group id="description" className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={description}
                  onChange={onChange}
                  required
                />
              </Form.Group>
              
              <Form.Group id="image" className="mb-3">
                <Form.Label>Upload Image</Form.Label>
                <Form.Control
                  type="file"
                  onChange={onFileChange}
                  accept="image/*"
                />
                {image && (
                  <div className="mt-2">
                    <img src={URL.createObjectURL(image)} alt="Preview" height="100" />
                  </div>
                )}
              </Form.Group>
              
              <Button disabled={loading} className="w-100" type="submit">
                Submit Report
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default ReportForm;