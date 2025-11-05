import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReportList from '../reports/ReportList';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Welcome, {user?.name}!</h1>
          <p className="text-muted">Report and track issues in your campus</p>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => navigate('/report-form')}>
            Report New Issue
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header as="h5">Your Reports</Card.Header>
            <Card.Body>
              <ReportList userId={user?._id} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;