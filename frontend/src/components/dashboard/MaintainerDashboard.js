import React, { useState } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Form, Button } from 'react-bootstrap';
import ReportList from '../reports/ReportList';
import { useAuth } from '../../context/AuthContext';

const MaintainerDashboard = () => {
  const { user } = useAuth();
  const [key, setKey] = useState('assigned');
  const [filter, setFilter] = useState({
    status: 'assigned'
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Maintainer Dashboard</h1>
          <p className="text-muted">Manage assigned reports and track their progress</p>
          <div className="d-flex gap-2 mt-3">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Refresh Reports
            </Button>
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Header as="h5">Reports</Card.Header>
            <Card.Body>
              <Tabs
                id="report-tabs"
                activeKey={key}
                onSelect={(k) => {
                  setKey(k);
                  setFilter({ ...filter, status: k });
                }}
                className="mb-3"
              >
                <Tab eventKey="assigned" title="Assigned Reports">
                  <ReportList status="assigned,verified" category={user.category} />
                </Tab>
                <Tab eventKey="in_progress" title="In Progress">
                  <ReportList status="in_progress" category={user.category} />
                </Tab>
                <Tab eventKey="resolved" title="Resolved">
                  <ReportList status="resolved" category={user.category} />
                </Tab>

              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MaintainerDashboard;