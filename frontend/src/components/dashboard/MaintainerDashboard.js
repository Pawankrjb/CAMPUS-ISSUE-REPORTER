import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import ReportList from '../reports/ReportList';
import { useAuth } from '../../context/AuthContext';

const MaintainerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assigned');

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  return (
    <Container>
      <Row className="mb-4" style={{ background: 'linear-gradient(135deg, rgb(103, 184, 200) 0%, rgb(86 110 111) 100%)' }}>
        <Col>
          <Card className="glass-card border-0">
            <Card.Body>
              <h1>Maintainer Dashboard</h1>
              <p className="text-muted">Manage assigned reports and track their progress</p>
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
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Header as="h5">Reports</Card.Header>
            <Card.Body>
              <ul className="mb-3 nav nav-tabs" id="report-tabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    type="button"
                    id="report-tabs-tab-assigned"
                    role="tab"
                    data-rr-ui-event-key="assigned"
                    aria-controls="report-tabs-tabpane-assigned"
                    aria-selected={activeTab === 'assigned'}
                    className={`nav-link ${activeTab === 'assigned' ? 'active' : ''}`}
                    tabIndex={activeTab === 'assigned' ? 0 : -1}
                    onClick={() => handleTabChange('assigned')}
                  >
                    Assigned Reports
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    type="button"
                    id="report-tabs-tab-in_progress"
                    role="tab"
                    data-rr-ui-event-key="in_progress"
                    aria-controls="report-tabs-tabpane-in_progress"
                    aria-selected={activeTab === 'in_progress'}
                    className={`nav-link ${activeTab === 'in_progress' ? 'active' : ''}`}
                    tabIndex={activeTab === 'in_progress' ? 0 : -1}
                    onClick={() => handleTabChange('in_progress')}
                  >
                    In Progress
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    type="button"
                    id="report-tabs-tab-resolved"
                    role="tab"
                    data-rr-ui-event-key="resolved"
                    aria-controls="report-tabs-tabpane-resolved"
                    aria-selected={activeTab === 'resolved'}
                    className={`nav-link ${activeTab === 'resolved' ? 'active' : ''}`}
                    tabIndex={activeTab === 'resolved' ? 0 : -1}
                    onClick={() => handleTabChange('resolved')}
                  >
                    Resolved
                  </button>
                </li>
              </ul>
              <div className="tab-content">
                {activeTab === 'assigned' && <ReportList />}
                {activeTab === 'in_progress' && <ReportList status="in_progress" />}
                {activeTab === 'resolved' && <ReportList status="resolved" />}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MaintainerDashboard;