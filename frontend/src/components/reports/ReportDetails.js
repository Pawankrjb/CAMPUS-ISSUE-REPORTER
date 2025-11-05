import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Container, Button, Badge, Alert, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ReportDetails = () => {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [closureImage, setClosureImage] = useState(null);
  const [fieldHeads, setFieldHeads] = useState([]);
  const [selectedFieldHead, setSelectedFieldHead] = useState('');
  const [verifyForm, setVerifyForm] = useState({
    status: 'verified',
    department: ''
  });
  const [statusForm, setStatusForm] = useState({
    status: 'in_progress'
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get(`/reports/${reportId}`);
        setReport(response.data.report);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]); // Only depend on reportId to prevent unnecessary re-runs

  useEffect(() => {
    const fetchFieldHeads = async () => {
      if (report && report.department) {
        try {
          const response = await api.get(`/users/field-heads?department=${report.department}`);
          setFieldHeads(response.data.users);
        } catch (error) {
          console.error('Failed to fetch field heads:', error);
        }
      }
    };

    fetchFieldHeads();
  }, [report]);

  const handleVerify = async () => {
    try {
      await api.put(`/reports/${reportId}/verify`, {
        ...verifyForm,
        maintainerId: user._id,
        maintainerName: user.name,
        department: user?.role === 'field_head' ? user.department : verifyForm.department
      });

      // Refresh report data
      const response = await api.get(`/reports/${reportId}`);
      setReport(response.data.report);

      setShowVerifyModal(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to verify report');
    }
  };

  const handleAssign = async () => {
    try {
      const fieldHead = fieldHeads.find(fh => fh._id === selectedFieldHead);
      
      await api.put(`/reports/${reportId}/assign`, {
        fieldHeadId: selectedFieldHead,
        fieldHeadName: fieldHead.name
      });
      
      // Refresh report data
      const response = await api.get(`/reports/${reportId}`);
      setReport(response.data.report);
      
      setShowAssignModal(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to assign report');
    }
  };

  const handleStatusUpdate = async () => {
    if (user.role !== 'maintainer') return;

    try {
      const formData = new FormData();
      formData.append('status', statusForm.status);
      if (closureImage && statusForm.status === 'resolved') {
        formData.append('closureImage', closureImage);
      }

      await api.put(`/reports/${reportId}/status`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Refresh report data
      const response = await api.get(`/reports/${reportId}`);
      setReport(response.data.report);

      setShowStatusModal(false);
    } catch (error) {
      // Swallow expected errors for non-maintainers
      if (error.response?.status !== 403 && !axios.isCancel(error)) {
        setError(error.response?.data?.error || 'Failed to update status');
      }
    }
  };

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
    return <Container className="mt-4"><div>Loading...</div></Container>;
  }

  if (error) {
    return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  }

  if (!report) {
    return <Container className="mt-4"><div>Report not found</div></Container>;
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h3>{report.title}</h3>
          <div>{getStatusBadge(report.status)}</div>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <strong>Category:</strong> {report.category}
          </div>
          <div className="mb-3">
            <strong>Location:</strong> {report.location}
          </div>
          <div className="mb-3">
            <strong>Description:</strong> {report.description}
          </div>
          <div className="mb-3">
            <strong>Reported by:</strong> {report.reporterName}
          </div>
          <div className="mb-3">
            <strong>Reported on:</strong> {formatDate(report.createdAt)}
          </div>
          
          {report.imageUrl && (
            <div className="mb-3">
              <strong>Image:</strong>
              <div className="mt-2">
                <img src={report.imageUrl} alt="Issue" style={{ maxWidth: '100%', maxHeight: '300px' }} />
              </div>
            </div>
          )}
          
          {report.maintainerName && (
            <div className="mb-3">
              <strong>Verified by:</strong> {report.maintainerName}
            </div>
          )}
          
          {report.department && (
            <div className="mb-3">
              <strong>Department:</strong> {report.department}
            </div>
          )}
          
          {report.fieldHeadName && (
            <div className="mb-3">
              <strong>Assigned to:</strong> {report.fieldHeadName}
            </div>
          )}
          
          {report.closureImageUrl && (
            <div className="mb-3">
              <strong>Closure Image:</strong>
              <div className="mt-2">
                <img src={report.closureImageUrl} alt="Closure" style={{ maxWidth: '100%', maxHeight: '300px' }} />
              </div>
            </div>
          )}
          
          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Back
            </Button>
            
            {(user?.role === 'maintainer' || user?.role === 'field_head') && report.status === 'pending' && (
              <Button variant="primary" onClick={() => setShowVerifyModal(true)}>
                Verify Report
              </Button>
            )}

            {user.role === 'maintainer' && report.status === 'verified' && (
              <Button variant="warning" onClick={() => setShowAssignModal(true)}>
                Assign to Field Head
              </Button>
            )}

            {user && user.role === 'maintainer' &&
             (report.status === 'assigned' || report.status === 'verified' || report.status === 'in_progress') && (
              <Button variant="success" onClick={() => {
                if (user.role === 'maintainer') {
                  setShowStatusModal(true);
                }
              }}>
                Update Status
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
      
      {/* Verify Modal */}
      <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Verify Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={verifyForm.status}
              onChange={(e) => setVerifyForm({ ...verifyForm, status: e.target.value })}
            >
              <option value="verified">Verified</option>
              <option value="fake">Fake</option>
            </Form.Select>
          </Form.Group>
          
          {verifyForm.status === 'verified' && (
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Select
                value={verifyForm.department}
                onChange={(e) => setVerifyForm({ ...verifyForm, department: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                {user?.role === 'field_head' ? (
                  <option value={user.department}>{user.department}</option>
                ) : (
                  <>
                    <option value="road">Road</option>
                    <option value="electric">Electric</option>
                    <option value="water">Water</option>
                    <option value="building">Building</option>
                    <option value="other">Other</option>
                  </>
                )}
              </Form.Select>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleVerify}>
            Verify
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Assign Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign to Field Head</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Select Field Head</Form.Label>
            <Form.Select
              value={selectedFieldHead}
              onChange={(e) => setSelectedFieldHead(e.target.value)}
              required
            >
              <option value="">Select Field Head</option>
              {fieldHeads.map(fieldHead => (
                <option key={fieldHead._id} value={fieldHead._id}>
                  {fieldHead.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssign}>
            Assign
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Status Update Modal - Only render for maintainers */}
      {user && user.role === 'maintainer' && (
        <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
              >
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </Form.Select>
            </Form.Group>

            {statusForm.status === 'resolved' && (
              <Form.Group className="mb-3">
                <Form.Label>Closure Image</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setClosureImage(e.target.files[0])}
                  accept="image/*"
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleStatusUpdate}>
              Update
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default ReportDetails;