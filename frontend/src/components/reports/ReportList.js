import React, { useState, useEffect, useMemo } from 'react';
import { Card, ListGroup, Badge, Button, Spinner, Alert, Modal, Dropdown, Pagination, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ReportList = ({ userId, status, category, view }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const { user } = useAuth();
  const navigate = useNavigate();

  const reportsPerPage = 12;

  // Memoized filters and sorting
  const filteredAndSortedReports = useMemo(() => {
    let filtered = [...reports];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        report.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (status && status !== 'all') {
      filtered = filtered.filter(report => report.status === status);
    }

    // Apply category filter
    if (category && category !== 'all') {
      filtered = filtered.filter(report => report.category === category);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [reports, status, category, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReports.length / reportsPerPage);
  const startIndex = (currentPage - 1) * reportsPerPage;
  const paginatedReports = filteredAndSortedReports.slice(startIndex, startIndex + reportsPerPage);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        let url = '/reports';
        const params = new URLSearchParams();

        if (userId) {
          params.append('userId', userId);
        }

        if (status && status !== 'all') {
          params.append('status', status);
        }

        if (category && category !== 'all') {
          params.append('category', category);
        }

        if (view && view !== 'all') {
          params.append('view', view);
        }

        const response = await api.get(`${url}?${params.toString()}`);
        setReports(response.data.reports);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId, status, category, view]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'info', icon: 'fas fa-clock' },
      verified: { bg: 'primary', icon: 'fas fa-check-circle' },
      assigned: { bg: 'warning', icon: 'fas fa-user-check' },
      in_progress: { bg: 'secondary', icon: 'fas fa-spinner fa-spin' },
      resolved: { bg: 'success', icon: 'fas fa-check-double' },
      fake: { bg: 'danger', icon: 'fas fa-times-circle' },
      closed: { bg: 'dark', icon: 'fas fa-lock' }
    };

    const config = statusConfig[status] || { bg: 'secondary', icon: 'fas fa-question' };
    return (
      <Badge bg={config.bg} className="d-flex align-items-center gap-1">
        <i className={config.icon}></i>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      electric: 'fas fa-bolt',
      water: 'fas fa-tint',
      road: 'fas fa-road',
      building: 'fas fa-building',
      other: 'fas fa-exclamation-triangle'
    };
    return icons[category] || 'fas fa-exclamation-triangle';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      const response = await api.put(`/reports/${reportId}/status`, { status: newStatus });

      setReports(prev => prev.map(report =>
        report._id === reportId ? { ...report, status: newStatus } : report
      ));

      setSuccess(`Report status updated to ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update report status');
    }
  };

  const handleFieldHeadAction = async (reportId, action) => {
    try {
      const payload = {
        status: action,
        maintainerId: user._id,
        maintainerName: user.name,
        department: user.department
      };

      const response = await api.put(`/reports/${reportId}/verify`, payload);

      setReports(prev => prev.map(report =>
        report._id === reportId ? { ...report, status: action } : report
      ));

      setSuccess(`Report marked as ${action}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || `Failed to mark report as ${action}`);
    }
  };

  const handleDelete = async (reportId) => {
    try {
      await api.delete(`/reports/${reportId}`);
      setReports(prev => prev.filter(report => report._id !== reportId));
      setDeleteConfirm(null);
      setSuccess('Report deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete report');
    }
  };

  const handleFilterChange = (filterType, value) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== 'all') {
      params.set(filterType, value);
    } else {
      params.delete(filterType);
    }
    navigate(`${window.location.pathname}?${params.toString()}`);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const clearFilters = () => {
    navigate(window.location.pathname);
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="reports-container" style={{ 
      background: 'linear-gradient(135deg, #67b8c8ff 0%, #456568ff 100%)', 
      minHeight: '100vh', 
      padding: '20px 0',
      position: 'relative'
    }}>
      {/* Background decorative elements */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Header */}
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <Card className="glass-card shadow-lg border-0">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h1 className="mb-2 text-white">
                      <i className="fas fa-clipboard-list me-3"></i>
                      Campus Issue Reports
                    </h1>
                    <p className="text-white-50 mb-0">Manage and track all reported issues</p>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <InputGroup className="glass-input-group">
                      <InputGroup.Text>
                        <i className="fas fa-search"></i>
                      </InputGroup.Text>
                      <Form.Control 
                        type="text" 
                        placeholder="Search reports..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="glass-input"
                      />
                    </InputGroup>
                  </div>
                  <div className="col-md-2">
                    <Form.Select 
                      value={status || 'all'} 
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="glass-select"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="fake">Fake</option>
                    </Form.Select>
                  </div>
                  <div className="col-md-2">
                    <Form.Select 
                      value={category || 'all'} 
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="glass-select"
                    >
                      <option value="all">All Categories</option>
                      <option value="electric">Electric</option>
                      <option value="water">Water</option>
                      <option value="road">Road</option>
                      <option value="building">Building</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </div>
                  <div className="col-md-2">
                    <Form.Select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="glass-select"
                    >
                      <option value="createdAt">Sort by Date</option>
                      <option value="title">Sort by Title</option>
                      <option value="status">Sort by Status</option>
                    </Form.Select>
                  </div>
                  <div className="col-md-2">
                    <Button variant="outline-light" onClick={clearFilters} className="w-100">
                      <i className="fas fa-times me-2"></i>
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Stats - Only show for non-maintainer roles */}
                {user && user.role !== 'maintainer' && (
                  <div className="row g-3 mb-4">
                    <div className="col-md-3">
                      <Card className="glass-stat-card text-center border-0 shadow-sm">
                        <Card.Body>
                          <i className="fas fa-clipboard-list fa-2x mb-2 text-white"></i>
                          <h4 className="mb-1 text-white">{reports.length}</h4>
                          <small className="text-white-50">Total Reports</small>
                        </Card.Body>
                      </Card>
                    </div>
                    <div className="col-md-3">
                      <Card className="glass-stat-card text-center border-0 shadow-sm">
                        <Card.Body>
                          <i className="fas fa-clock fa-2x mb-2 text-warning"></i>
                          <h4 className="mb-1 text-white">{reports.filter(r => r.status === 'pending').length}</h4>
                          <small className="text-white-50">Pending</small>
                        </Card.Body>
                      </Card>
                    </div>
                    <div className="col-md-3">
                      <Card className="glass-stat-card text-center border-0 shadow-sm">
                        <Card.Body>
                          <i className="fas fa-check-circle fa-2x mb-2 text-success"></i>
                          <h4 className="mb-1 text-white">{reports.filter(r => r.status === 'resolved').length}</h4>
                          <small className="text-white-50">Resolved</small>
                        </Card.Body>
                      </Card>
                    </div>
                    <div className="col-md-3">
                      <Card className="glass-stat-card text-center border-0 shadow-sm">
                        <Card.Body>
                          <i className="fas fa-times-circle fa-2x mb-2 text-danger"></i>
                          <h4 className="mb-1 text-white">{reports.filter(r => r.status === 'fake').length}</h4>
                          <small className="text-white-50">Fake Reports</small>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                )}

              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" size="lg" />
            <p className="mt-3 text-white">Loading reports...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert variant="danger" className="text-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Reports Grid */}
        {!loading && !error && (
          <>
            {paginatedReports.length === 0 ? (
              <Card className="glass-card text-center py-5 shadow">
                <Card.Body>
                  <i className="fas fa-inbox fa-4x text-white-50 mb-3"></i>
                  <h3 className="text-white">No reports found</h3>
                  <p className="text-white-50">
                    {searchTerm || status !== 'all' || category !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'No reports have been submitted yet'
                    }
                  </p>
                  <Button as={Link} to="/report-form" variant="light">
                    <i className="fas fa-plus-circle me-2"></i>
                    Create First Report
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <>
                <div className="row g-4">
                  {paginatedReports.map(report => (
                    <div key={report._id} className="col-lg-4 col-md-6">
                      <Card className="glass-card h-100 shadow-sm">
                        <Card.Header className="d-flex justify-content-between align-items-center border-0">
                          <div className="d-flex align-items-center">
                            <div className="category-icon me-3 p-2 rounded-circle">
                              <i className={getCategoryIcon(report.category)}></i>
                            </div>
                            <div>
                              <Card.Title className="mb-0 fs-6 text-white">{report.title}</Card.Title>
                              <small className="text-white-50">
                                <i className="fas fa-tag me-1"></i>
                                {report.category} • 
                                <i className="fas fa-map-marker-alt ms-1 me-1"></i>
                                {report.location}
                              </small>
                            </div>
                          </div>
                          {getStatusBadge(report.status)}
                        </Card.Header>
                        <Card.Body className="d-flex flex-column">
                          <Card.Text className="flex-grow-1 text-white">
                            {report.description.length > 120 
                              ? `${report.description.substring(0, 120)}...` 
                              : report.description
                            }
                          </Card.Text>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <small className="text-white-50">
                                <i className="far fa-calendar me-1"></i>
                                {formatDate(report.createdAt)}
                              </small>
                              <small className="text-white-50">
                                <i className="fas fa-user me-1"></i>
                                {report.reporterName}
                              </small>
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                              <Button
                                as={Link}
                                to={`/reports/${report._id}`}
                                variant="outline-light"
                                size="sm"
                                className="flex-fill"
                              >
                                <i className="fas fa-eye me-1"></i>
                                View
                              </Button>
                              {user && user.role === 'field_head' && report.status === 'pending' && (
                                <div className="d-flex gap-1">
                                  <Button
                                    variant="outline-light"
                                    size="sm"
                                    onClick={() => handleFieldHeadAction(report._id, 'verified')}
                                    className="flex-fill"
                                  >
                                    <i className="fas fa-check me-1"></i>
                                    Verify
                                  </Button>
                                  <Button
                                    variant="outline-light"
                                    size="sm"
                                    onClick={() => handleFieldHeadAction(report._id, 'fake')}
                                    className="flex-fill"
                                  >
                                    <i className="fas fa-times me-1"></i>
                                    Fake
                                  </Button>
                                </div>
                              )}
                              {user && user.role === 'maintainer' && (report.status === 'verified' || report.status === 'assigned') && (
                                <Button
                                  variant="outline-light"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(report._id, 'in_progress')}
                                  className="flex-fill"
                                >
                                  <i className="fas fa-play me-1"></i>
                                  Start Work
                                </Button>
                              )}
                              {user && user.role === 'maintainer' && report.status === 'in_progress' && (
                                <Button
                                  variant="outline-light"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(report._id, 'resolved')}
                                  className="flex-fill"
                                >
                                  <i className="fas fa-check me-1"></i>
                                  Resolved
                                </Button>
                              )}

                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination className="glass-pagination">
                      <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                      <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                      {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item 
                          key={index + 1} 
                          active={index + 1 === currentPage} 
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                      <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Success Message */}
        {success && (
          <Alert variant="success" className="position-fixed top-0 end-0 m-3 shadow" style={{ zIndex: 1050, minWidth: '300px' }} dismissible onClose={() => setSuccess('')}>
            <i className="fas fa-check-circle me-2"></i>
            {success}
          </Alert>
        )}

        {/* Delete Confirmation Modal */}
        <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered className="glass-modal">
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete the report "{deleteConfirm?.title}"?</p>
            <p className="text-muted">This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteConfirm._id)}>
              <i className="fas fa-trash me-2"></i>
              Delete Report
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .glass-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.25);
        }
        
        .glass-stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .glass-stat-card:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.15);
        }
        
        .glass-input-group {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .glass-input, .glass-select {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
        }
        
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .glass-input:focus, .glass-select:focus {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          box-shadow: none;
        }
        
        .glass-select option {
          background: #667eea;
          color: white;
        }
        
        .glass-dropdown {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .glass-pagination .page-link {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .glass-pagination .page-link:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .glass-pagination .page-item.active .page-link {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.3);
        }
        
        .glass-modal .modal-content {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .category-icon {
          background: linear-gradient(45deg, #a7faff, #2c4c52);
          color: white;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }
        
        .category-icon:hover {
          transform: scale(1.1);
        }
        
        .bg-shapes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: -1;
        }
        
        .shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.5;
        }
        
        .shape-1 {
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.1);
          top: -150px;
          right: -150px;
        }
        
        .shape-2 {
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.05);
          bottom: -200px;
          left: -200px;
        }
        
        .shape-3 {
          width: 250px;
          height: 250px;
          background: rgba(255, 255, 255, 0.08);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      `}</style>
    </div>
  );
};

export default ReportList;