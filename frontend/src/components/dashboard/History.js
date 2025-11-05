import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const History = () => {
  const [allReports, setAllReports] = useState([]);
  const [verifiedReports, setVerifiedReports] = useState([]);
  const [fakeReports, setFakeReports] = useState([]);
  const [assignedReports, setAssignedReports] = useState([]);
  const [inProgressReports, setInProgressReports] = useState([]);
  const [resolvedReports, setResolvedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    fake: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0
  });
  const { user } = useAuth();

  const fetchReports = async (status = null) => {
    let url = `/reports/department-history/${user.department}`;
    if (status && status !== 'all') {
      url += `?status=${status}`;
    }
    const response = await api.get(url);
    return response.data.reports;
  };

  useEffect(() => {
    const loadReports = async () => {
      try {
        if (!user || !user.department) {
          setError('User department not found. Please contact administrator.');
          setLoading(false);
          return;
        }

        const all = await fetchReports();
        const verified = await fetchReports('verified');
        const fake = await fetchReports('fake');
        const assigned = await fetchReports('assigned');
        const inProgress = await fetchReports('in_progress');
        const resolved = await fetchReports('resolved');

        setAllReports(all);
        setVerifiedReports(verified);
        setFakeReports(fake);
        setAssignedReports(assigned);
        setInProgressReports(inProgress);
        setResolvedReports(resolved);

        // Calculate stats correctly - fake count comes from fake reports array
        setStats({
          total: all.length,
          verified: verified.length,
          fake: fake.length,
          assigned: assigned.length,
          inProgress: inProgress.length,
          resolved: resolved.length
        });
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError(error.response?.data?.error || 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    if (user?.department) {
      loadReports();
    }
  }, [user?.department]); // Only depend on department to prevent unnecessary re-runs

  const getStatusBadge = (status) => {
    switch (status) {
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
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
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
          <h1>Report History</h1>
          <p className="text-muted">
            Department: {user.department} - View all reports handled by your department
          </p>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-primary">{stats.total}</Card.Title>
              <Card.Text>Total Reports</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-success">{stats.verified}</Card.Title>
              <Card.Text>Verified</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-warning">{stats.assigned}</Card.Title>
              <Card.Text>Assigned</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-info">{stats.inProgress}</Card.Title>
              <Card.Text>In Progress</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-success">{stats.resolved}</Card.Title>
              <Card.Text>Resolved</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-danger">{stats.fake}</Card.Title>
              <Card.Text>Fake</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header as="h5">Reports</Card.Header>
            <Card.Body>
              <Tabs defaultActiveKey="all" id="history-tabs" className="mb-3">
                <Tab eventKey="all" title="All Reports">
                  <ReportTable reports={allReports} getStatusBadge={getStatusBadge} formatDate={formatDate} />
                </Tab>
                <Tab eventKey="verified" title="Verified">
                  <ReportTable reports={verifiedReports} getStatusBadge={getStatusBadge} formatDate={formatDate} />
                </Tab>
                <Tab eventKey="fake" title="Fake">
                  <ReportTable reports={fakeReports} getStatusBadge={getStatusBadge} formatDate={formatDate} />
                </Tab>
                <Tab eventKey="assigned" title="Assigned">
                  <ReportTable reports={assignedReports} getStatusBadge={getStatusBadge} formatDate={formatDate} />
                </Tab>
                <Tab eventKey="in_progress" title="In Progress">
                  <ReportTable reports={inProgressReports} getStatusBadge={getStatusBadge} formatDate={formatDate} />
                </Tab>
                <Tab eventKey="resolved" title="Resolved">
                  <ReportTable reports={resolvedReports} getStatusBadge={getStatusBadge} formatDate={formatDate} />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const ReportTable = ({ reports, getStatusBadge, formatDate }) => {
  if (reports.length === 0) {
    return <div className="text-center mt-4">No reports found</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Location</th>
            <th>Status</th>
            <th>Reporter</th>
            <th>Created</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report._id}>
              <td>{report.title}</td>
              <td>{report.category}</td>
              <td>{report.location}</td>
              <td>{getStatusBadge(report.status)}</td>
              <td>{report.reporterName}</td>
              <td>{formatDate(report.createdAt)}</td>
              <td>{report.department || 'Not Assigned'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default History;
