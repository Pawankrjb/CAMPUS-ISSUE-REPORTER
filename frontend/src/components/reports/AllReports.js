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
  const [actionFeedback, setActionFeedback] = useState({}); // Track which reports have action feedback
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

  // Get pending reports for verification section
  const pendingReports = useMemo(() => {
    return reports.filter(report => report.status === 'pending');
  }, [reports]);

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
      <Badge bg={config.bg} className="d-flex align-items-center gap-1 px-3 py-2">
        <i className={config.icon}></i>
        <span className="fw-bold">{status.replace('_', ' ').toUpperCase()}</span>
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

      // Show action feedback
      setActionFeedback(prev => ({
        ...prev,
        [reportId]: newStatus === 'verified' ? 'verified' : newStatus === 'fake' ? 'fake' : null
      }));
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setActionFeedback(prev => ({
          ...prev,
          [reportId]: null
        }));
      }, 3000);

      setSuccess(`Report status updated to ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update report status');
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
      background: 'linear-gradient(135deg, #8dcbd7ff 0%, #587f8aff 100%)', 
      minHeight: '100vh', 
      padding: '20px 0',
      position: 'relative',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Background decorative elements */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* Verification Section for Maintainers */}
      {user && user.role === 'maintainer' && pendingReports.length > 0 && (
        <div className="container-fluid mb-4">
          <Card className="glass-card shadow-lg border-0">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 className="mb-2 text-white" style={{ fontWeight: '700', letterSpacing: '-0.5px' }}>
                    <i className="fas fa-clipboard-check me-3"></i>
                    Verification Queue
                  </h2>
                  <p className="text-white-50 mb-0" style={{ fontSize: '1rem', fontWeight: '500' }}>
                    {pendingReports.length} report{pendingReports.length > 1 ? 's' : ''} pending verification
                  </p>
                </div>
                <Badge bg="info" className="px-3 py-2" style={{ fontSize: '1.2rem' }}>
                  {pendingReports.length}
                </Badge>
              </div>
              
              <div className="row g-3">
                {pendingReports.slice(0, 4).map(report => (
                  <div key={report._id} className="col-md-6 col-lg-3">
                    <Card className="glass-verify-card h-100">
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-start mb-2">
                          <div className="category-icon-sm me-2">
                            <i className={getCategoryIcon(report.category)}></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="text-white mb-1" style={{ fontWeight: '600' }}>
                              {report.title}
                            </h6>
                            <small className="text-white-50">
                              <i className="fas fa-map-marker-alt me-1"></i>
                              {report.location}
                            </small>
                          </div>
                        </div>
                        <p className="text-white-50 small mb-3" style={{ lineHeight: '1.4' }}>
                          {report.description.length > 60 
                            ? `${report.description.substring(0, 60)}...` 
                            : report.description
                          }
                        </p>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="success" 
                            size="sm" 
                            className="flex-fill"
                            style={{ fontWeight: '600', borderRadius: '6px' }}
                            onClick={() => handleStatusUpdate(report._id, 'verified')}
                          >
                            <i className="fas fa-check-circle me-1"></i>
                            Verify
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="flex-fill"
                            style={{ fontWeight: '600', borderRadius: '6px' }}
                            onClick={() => handleStatusUpdate(report._id, 'fake')}
                          >
                            <i className="fas fa-times-circle me-1"></i>
                            Fake
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
              
              {pendingReports.length > 4 && (
                <div className="text-center mt-3">
                  <Button 
                    variant="outline-light" 
                    size="sm"
                    style={{ fontWeight: '600', borderRadius: '8px' }}
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set('status', 'pending');
                      navigate(`${window.location.pathname}?${params.toString()}`);
                    }}
                  >
                    View All Pending Reports ({pendingReports.length - 4} more)
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Reports Container */}
      <div className="container-fluid">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" size="lg" />
            <p className="mt-3 text-white" style={{ fontWeight: '500' }}>Loading reports...</p>
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
                  <h3 className="text-white" style={{ fontWeight: '600' }}>No reports found</h3>
                  <p className="text-white-50" style={{ fontWeight: '500' }}>
                    {searchTerm || status !== 'all' || category !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'No reports have been submitted yet'
                    }
                  </p>
                  <Button 
                    as={Link} 
                    to="/report-form" 
                    variant="light"
                    style={{ fontWeight: '600', borderRadius: '10px' }}
                  >
                    <i className="fas fa-plus-circle me-2"></i>
                    <span>Create First Report</span>
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <>
                <div className="row g-4">
                  {paginatedReports.map(report => (
                    <div key={report._id} className="col-lg-4 col-md-6">
                      <Card className={`glass-card h-100 shadow-sm ${actionFeedback[report._id] ? 'action-feedback' : ''}`}>
                        <Card.Header className="d-flex justify-content-between align-items-center border-0">
                          <div className="d-flex align-items-center">
                            <div className="category-icon me-3 p-2 rounded-circle">
                              <i className={getCategoryIcon(report.category)}></i>
                            </div>
                            <div>
                              <Card.Title className="mb-0 fs-6 text-white" style={{ fontWeight: '600' }}>
                                {report.title}
                              </Card.Title>
                              <small className="text-white-50">
                                <i className="fas fa-tag me-1"></i>
                                <span style={{ fontWeight: '500' }}>{report.category}</span> • 
                                <i className="fas fa-map-marker-alt ms-1 me-1"></i>
                                <span style={{ fontWeight: '500' }}>{report.location}</span>
                              </small>
                            </div>
                          </div>
                          {getStatusBadge(report.status)}
                        </Card.Header>
                        <Card.Body className="d-flex flex-column">
                          <Card.Text className="flex-grow-1 text-white" style={{ fontWeight: '400', lineHeight: '1.6' }}>
                            {report.description.length > 120 
                              ? `${report.description.substring(0, 120)}...` 
                              : report.description
                            }
                          </Card.Text>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <small className="text-white-50">
                                <i className="far fa-calendar me-1"></i>
                                <span style={{ fontWeight: '500' }}>{formatDate(report.createdAt)}</span>
                              </small>
                              <small className="text-white-50">
                                <i className="fas fa-user me-1"></i>
                                <span style={{ fontWeight: '500' }}>{report.reporterName}</span>
                              </small>
                            </div>
                            
                            {/* Action Feedback Indicator */}
                            {actionFeedback[report._id] && (
                              <div className={`action-indicator mb-3 ${actionFeedback[report._id] === 'verified' ? 'verified' : 'fake'}`}>
                                <div className="d-flex align-items-center">
                                  <i className={`fas ${actionFeedback[report._id] === 'verified' ? 'fa-check-circle' : 'fa-times-circle'} me-2`}></i>
                                  <span>Report {actionFeedback[report._id] === 'verified' ? 'Verified' : 'Marked as Fake'}</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="d-flex gap-2 flex-wrap">
                              <Button 
                                as={Link} 
                                to={`/reports/${report._id}`} 
                                variant="outline-light" 
                                size="sm" 
                                className="flex-fill"
                                style={{ fontWeight: '600', borderRadius: '8px' }}
                              >
                                <i className="fas fa-eye me-1"></i>
                                <span>View</span>
                              </Button>
                              
                              {/* Verify and Fake Buttons for Maintainers */}
                              {user && user.role === 'maintainer' && (
                                <>
                                  {report.status === 'pending' && (
                                    <Button 
                                      variant="success" 
                                      size="sm" 
                                      className="action-btn verify-btn"
                                      style={{ fontWeight: '600', borderRadius: '8px' }}
                                      onClick={() => handleStatusUpdate(report._id, 'verified')}
                                    >
                                      <i className="fas fa-check-circle me-1"></i>
                                      <span>Verify</span>
                                    </Button>
                                  )}
                                  
                                  {(report.status === 'pending' || report.status === 'verified') && (
                                    <Button 
                                      variant="danger" 
                                      size="sm" 
                                      className="action-btn fake-btn"
                                      style={{ fontWeight: '600', borderRadius: '8px' }}
                                      onClick={() => handleStatusUpdate(report._id, 'fake')}
                                    >
                                      <i className="fas fa-times-circle me-1"></i>
                                      <span>Fake</span>
                                    </Button>
                                  )}
                                </>
                              )}
                              
                              {/* More Options Dropdown for Maintainers */}
                              {user && user.role === 'maintainer' && (
                                <Dropdown>
                                  <Dropdown.Toggle 
                                    variant="outline-light" 
                                    size="sm" 
                                    id={`dropdown-${report._id}`}
                                    style={{ fontWeight: '600', borderRadius: '8px' }}
                                  >
                                    <i className="fas fa-cog"></i>
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu className="glass-dropdown">
                                    {report.status === 'pending' && (
                                      <Dropdown.Item onClick={() => handleStatusUpdate(report._id, 'verified')}>
                                        <i className="fas fa-check text-success me-2"></i>
                                        <span style={{ fontWeight: '500' }}>Verify</span>
                                      </Dropdown.Item>
                                    )}
                                    {report.status === 'verified' && (
                                      <Dropdown.Item onClick={() => handleStatusUpdate(report._id, 'assigned')}>
                                        <i className="fas fa-user-check text-primary me-2"></i>
                                        <span style={{ fontWeight: '500' }}>Assign</span>
                                      </Dropdown.Item>
                                    )}
                                    {(report.status === 'assigned' || report.status === 'in_progress') && (
                                      <Dropdown.Item onClick={() => handleStatusUpdate(report._id, report.status === 'assigned' ? 'in_progress' : 'resolved')}>
                                        <i className="fas fa-play text-warning me-2"></i>
                                        <span style={{ fontWeight: '500' }}>
                                          {report.status === 'assigned' ? 'Start Work' : 'Complete'}
                                        </span>
                                      </Dropdown.Item>
                                    )}
                                    {report.status === 'resolved' && (
                                      <Dropdown.Item onClick={() => handleStatusUpdate(report._id, 'closed')}>
                                        <i className="fas fa-lock text-dark me-2"></i>
                                        <span style={{ fontWeight: '500' }}>Close</span>
                                      </Dropdown.Item>
                                    )}
                                    {(report.status === 'pending' || report.status === 'verified') && (
                                      <Dropdown.Item onClick={() => handleStatusUpdate(report._id, 'fake')} className="text-danger">
                                        <i className="fas fa-times-circle me-2"></i>
                                        <span style={{ fontWeight: '500' }}>Mark as Fake</span>
                                      </Dropdown.Item>
                                    )}
                                    {report.status === 'fake' && (
                                      <Dropdown.Item onClick={() => setDeleteConfirm(report)} className="text-danger">
                                        <i className="fas fa-trash me-2"></i>
                                        <span style={{ fontWeight: '500' }}>Delete</span>
                                      </Dropdown.Item>
                                    )}
                                  </Dropdown.Menu>
                                </Dropdown>
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
                          style={{ fontWeight: '600' }}
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
            <span style={{ fontWeight: '600' }}>{success}</span>
          </Alert>
        )}

        {/* Delete Confirmation Modal */}
        <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered className="glass-modal">
          <Modal.Header closeButton>
            <Modal.Title style={{ fontWeight: '600' }}>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p style={{ fontWeight: '500' }}>Are you sure you want to delete report "{deleteConfirm?.title}"?</p>
            <p className="text-muted">This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)} style={{ fontWeight: '600' }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteConfirm._id)} style={{ fontWeight: '600' }}>
              <i className="fas fa-trash me-2"></i>
              <span>Delete Report</span>
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .glass-card {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }
        
        .glass-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.35);
        }
        
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        
        .glass-card:hover::before {
          opacity: 1;
        }
        
        .glass-card.action-feedback {
          animation: pulse 0.6s ease-in-out;
        }
        
        .glass-verify-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
        }
        
        .glass-verify-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }
        
        .glass-dropdown {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .glass-pagination .page-link {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          transition: all 0.3s ease;
        }
        
        .glass-pagination .page-link:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        
        .glass-pagination .page-item.active .page-link {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .glass-modal .modal-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }
        
        .category-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .category-icon:hover {
          transform: scale(1.15) rotate(5deg);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .category-icon-sm {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 0.875rem;
        }
        
        .action-btn {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }
        
        .action-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .action-btn:hover::before {
          width: 300px;
          height: 300px;
        }
        
        .verify-btn:hover {
          background: rgba(40, 167, 69, 0.9) !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(40, 167, 69, 0.4);
        }
        
        .fake-btn:hover {
          background: rgba(220, 53, 69, 0.9) !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(220, 53, 69, 0.4);
        }
        
        .action-indicator {
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          animation: slideIn 0.3s ease-out;
        }
        
        .action-indicator.verified {
          background: rgba(40, 167, 69, 0.2);
          color: #a5d6a7;
          border: 1px solid rgba(40, 167, 69, 0.3);
        }
        
        .action-indicator.fake {
          background: rgba(220, 53, 69, 0.2);
          color: #ef9a9a;
          border: 1px solid rgba(220, 53, 69, 0.3);
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
          filter: blur(60px);
          opacity: 0.4;
          animation: float 20s infinite ease-in-out;
        }
        
        .shape-1 {
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.1);
          top: -200px;
          right: -200px;
          animation-delay: 0s;
        }
        
        .shape-2 {
          width: 500px;
          height: 500px;
          background: rgba(255, 255, 255, 0.08);
          bottom: -250px;
          left: -250px;
          animation-delay: 5s;
        }
        
        .shape-3 {
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.06);
          top: 30%;
          left: 10%;
          animation-delay: 10s;
        }
        
        .shape-4 {
          width: 350px;
          height: 350px;
          background: rgba(255, 255, 255, 0.05);
          top: 60%;
          right: 15%;
          animation-delay: 15s;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.05);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          75% {
            transform: translate(20px, 30px) scale(1.02);
          }
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .btn-outline-light:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }
        
        .btn-success:hover {
          background: rgba(40, 167, 69, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
        }
        
        .btn-danger:hover {
          background: rgba(220, 53, 69, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(220, 53, 69, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ReportList;