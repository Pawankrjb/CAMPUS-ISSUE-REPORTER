import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Nav, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReportList from '../reports/ReportList';
import api from '../../services/api';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    resolvedReports: 0
  });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all reports for the user and calculate stats
        const response = await api.get(`/reports?userId=${user?._id}`);
        const reports = response.data;
        
        const calculatedStats = {
          totalReports: reports.length,
          pendingReports: reports.filter(r => r.status === 'pending').length,
          inProgressReports: reports.filter(r => r.status === 'in-progress').length,
          resolvedReports: reports.filter(r => r.status === 'resolved').length
        };
        
        setStats(calculatedStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Set default stats if API fails
        setStats({
          totalReports: 0,
          pendingReports: 0,
          inProgressReports: 0,
          resolvedReports: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchStats();
    }
  }, [user?._id]);

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Dashboard Header */}
      <Row className="mb-4 align-items-center">
        <Col md={12}>
          <h1 className="fw-bold mb-1" style={{ color: '#4a6b7a', fontSize: '2rem' }}>
            Welcome, {user?.name || 'User'}!
          </h1>
          <p className="text-muted mb-0">Report and track issues in your campus</p>
        </Col>
      </Row>



      {/* Reports Section */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
            <Card.Header className="bg-white py-3 border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="fw-bold mb-0" style={{ color: '#4a6b7a' }}>Your Reports</h4>
                <Button 
                  variant="primary" 
                  size="sm"
                  className="px-3 py-1 rounded-pill"
                  style={{ backgroundColor: '#80ACC2', border: 'none' }}
                  onClick={() => navigate('/report-form')}
                >
                  <i className="fas fa-plus me-1"></i>
                  New Report
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Filter Tabs */}
              <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav variant="tabs" className="px-4 pt-3 border-bottom">
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="all" 
                      className="text-muted fw-medium"
                      style={{ color: activeTab === 'all' ? '#80ACC2' : '#6c757d' }}
                    >
                      All Reports
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="pending" 
                      className="text-muted fw-medium"
                      style={{ color: activeTab === 'pending' ? '#80ACC2' : '#6c757d' }}
                    >
                      Pending
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="in-progress" 
                      className="text-muted fw-medium"
                      style={{ color: activeTab === 'in-progress' ? '#80ACC2' : '#6c757d' }}
                    >
                      In Progress
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      eventKey="resolved" 
                      className="text-muted fw-medium"
                      style={{ color: activeTab === 'resolved' ? '#80ACC2' : '#6c757d' }}
                    >
                      Resolved
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content className="p-4">
                  <ReportList userId={user?._id} status={activeTab === 'all' ? '' : activeTab} />
                </Tab.Content>
              </Tab.Container>
              
              {/* Quick Actions */}
              <div className="d-flex justify-content-between p-3 border-top bg-light">
                <div>
                  <Button variant="outline-secondary" size="sm" className="me-2">
                    <i className="fas fa-download me-1"></i>
                    Export Reports
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    <i className="fas fa-bell me-1"></i>
                    Notification Settings
                  </Button>
                </div>
                <Button variant="link" size="sm" className="text-decoration-none">
                  <i className="fas fa-question-circle me-1"></i>
                  Help Center
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;