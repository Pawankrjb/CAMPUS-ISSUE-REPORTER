import React, { useState, useEffect, useMemo } from 'react';
import { Card, ListGroup, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ReportList = ({ userId, status, category, view }) => {
  // Handle multiple statuses separated by comma - memoize to prevent re-computation
  const statusArray = useMemo(() => status ? status.split(',') : [], [status]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        let response;

        if (userId) {
          response = await api.get(`/reports/user/${userId}`);
        } else {
          const params = new URLSearchParams();
          if (statusArray.length > 0) {
            // If multiple statuses, append each one
            statusArray.forEach(s => params.append('status', s));
          } else if (status) {
            params.append('status', status);
          }
          if (category) params.append('category', category);
          if (view) params.append('view', view);

          response = await api.get(`/reports?${params.toString()}`);
        }

        setReports(response.data.reports);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId, status, category, view, statusArray]); // statusArray is now memoized, so this won't cause loops

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

  const handleVerify = async (reportId, status, department = '') => {
    try {
      await api.put(`/reports/${reportId}/verify`, {
        status,
        maintainerId: user._id,
        maintainerName: user.name,
        department
      });

      // Refresh the reports list
      const params = new URLSearchParams();
      if (statusArray.length > 0) {
        statusArray.forEach(s => params.append('status', s));
      } else if (status) {
        params.append('status', status);
      }
      if (category) params.append('category', category);
      const response = await api.get(`/reports?${params.toString()}`);
      setReports(response.data.reports);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to verify report');
    }
  };



  const handleStatusUpdate = async (reportId, newStatus) => {
    if (user.role !== 'maintainer') return;

    try {
      const formData = new FormData();
      formData.append('status', newStatus);

      await api.put(`/reports/${reportId}/status`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Refresh the reports list
      const params = new URLSearchParams();
      if (statusArray.length > 0) {
        statusArray.forEach(s => params.append('status', s));
      } else if (status) {
        params.append('status', status);
      }
      if (category) params.append('category', category);
      const response = await api.get(`/reports?${params.toString()}`);
      setReports(response.data.reports);
    } catch (error) {
      // Swallow expected errors for non-maintainers
      if (error.response?.status !== 403 && !axios.isCancel(error)) {
        setError(error.response?.data?.error || 'Failed to update status');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (reports.length === 0) {
    return <div className="text-center mt-4">No reports found</div>;
  }

  return (
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
                  <div className="d-flex gap-2 mt-2">
                    {user?.role === 'field_head' && report.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleVerify(report._id, 'verified', user?.role === 'field_head' ? user.department : 'road')} // Use field head's department
                        >
                          Verify
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleVerify(report._id, 'fake', user?.role === 'field_head' ? user.department : 'road')}
                        >
                          Mark Fake
                        </Button>
                      </>
                    )}

                    {user && user.role === 'maintainer' &&
                     (report.status === 'assigned' || report.status === 'verified') && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleStatusUpdate(report._id, 'in_progress')}
                      >
                        Start Work
                      </Button>
                    )}
                    {user && user.role === 'maintainer' &&
                     report.status === 'in_progress' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleStatusUpdate(report._id, 'resolved')}
                      >
                        Mark Resolved
                      </Button>
                    )}

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
  );
};

export default ReportList;