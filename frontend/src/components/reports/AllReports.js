import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AllReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Fetch all reports for the field head's department
        const response = await api.get(`/reports/department/${user.department}`);
        setReports(response.data.reports);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    if (user?.department) {
      fetchReports();
    }
  }, [user?.department]); // Only depend on department to prevent unnecessary re-runs

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="info">Pending</Badge>;
      case 'verified':
        return <Badge bg="primary">Verified</Badge>;
      case 'assigned':
        return <Badge bg="warning">Assigned</Badge>;
      case 'in_progress':
        return <Badge bg="secondary">In Progress</Badge>;
      case 'resolved':
        return <Badge bg="success">Resolved</Badge>;
      case 'fake':
        return <Badge bg="danger">Fake</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Container>
        <div className="d-flex justify-content-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="mt-4">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>All Reports in {user?.department} Department</h1>
          <p className="text-muted">View all reports assigned to your department</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header as="h5">Reports</Card.Header>
            <Card.Body>
              {reports.length === 0 ? (
                <div className="text-center mt-4">No reports found in your department</div>
              ) : (
                <ListGroup>
                  {reports.map(report => (
                    <ListGroup.Item key={report._id} className="mb-3">
                      <Card>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <Card.Title>{report.title}</Card.Title>
                              <Card.Subtitle className="mb-2 text-muted">
                                {report.category} • {report.location}
                              </Card.Subtitle>
                              <Card.Text>
                                {report.description.substring(0, 100)}
                                {report.description.length > 100 && '...'}
                              </Card.Text>
                              <Card.Text className="text-muted">
                                Reported by {report.reporterName} on {formatDate(report.createdAt)}
                              </Card.Text>
                            </div>
                            <div className="d-flex flex-column align-items-end">
                              {getStatusBadge(report.status)}
                              <div className="mt-2">
                                <Button
                                  as={Link}
                                  to={`/report/${report._id}`}
                                  variant="outline-primary"
                                  size="sm"
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AllReports;
