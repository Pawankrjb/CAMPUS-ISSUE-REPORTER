import React, { useState } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReportList from '../reports/ReportList';

const FieldHeadDashboard = () => {
  const { user } = useAuth();

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Field Head Dashboard</h1>
          <p className="text-muted">Department: {user?.department} - Verify and manage reports in your department</p>
          <div className="d-flex gap-2 mt-3">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Refresh Reports
            </Button>
            <Button as={Link} to="/history" variant="outline-secondary">
              View History
            </Button>
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
