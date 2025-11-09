import React, { useState } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReportList from '../reports/ReportList';
import api from '../../services/api';

const FieldHeadDashboard = () => {
  const { user } = useAuth();
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');

  const handleBulkVerify = async () => {
    if (!user?.department) return;

    setBulkActionLoading(true);
    try {
      const response = await api.put('/reports/bulk-verify', {
        department: user.department,
        fieldHeadId: user._id
      });

      setAlertMessage(`Successfully verified ${response.data.verifiedCount} reports`);
      setAlertType('success');
      setTimeout(() => {
        setAlertMessage('');
        window.location.reload();
      }, 3000);
    } catch (error) {
      setAlertMessage(error.response?.data?.error || 'Failed to verify reports');
      setAlertType('danger');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkMarkFake = async () => {
    if (!user?.department) return;

    setBulkActionLoading(true);
    try {
      const response = await api.put('/reports/bulk-mark-fake', {
        department: user.department,
        fieldHeadId: user._id
      });

      setAlertMessage(`Successfully marked ${response.data.markedCount} reports as fake`);
      setAlertType('success');
      setTimeout(() => {
        setAlertMessage('');
        window.location.reload();
      }, 3000);
    } catch (error) {
      setAlertMessage(error.response?.data?.error || 'Failed to mark reports as fake');
      setAlertType('danger');
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Field Head Dashboard</h1>
          <p className="text-muted">Department: {user?.department} - Verify and manage reports in your department</p>
          <div className="d-flex gap-2 mt-3">
            <button
              type="button"
              className="btn"
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#6e979d',
                borderColor: '#6e979d',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#8ba8ad';
                e.target.style.borderColor = '#8ba8ad';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#6e979d';
                e.target.style.borderColor = '#6e979d';
              }}
            >
              Refresh Reports
            </button>
            <a role="button" tabIndex="0" href="/history" className="btn btn-outline-secondary">
              View History
            </a>
          </div>
        </Col>
      </Row>



      <Row>
        <Col>
          <Card>
            <Card.Header as="h5">Verify Reports</Card.Header>
            <Card.Body>
              <ReportList view="verify_section" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FieldHeadDashboard;
