import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Spinner, Alert, Nav, Pagination, Form, InputGroup } from 'react-bootstrap';
import { FiCheckCircle, FiSearch, FiXCircle } from 'react-icons/fi';
import API from '../../api/endpoint';
import BootstrapButton from '../../components/common/BootstrapButton';
import { formatDate } from '../../utils/Utility';

const styles = `
  .approve-kyc-btn:hover:not(:disabled) {
    background-color: #198754 !important;
    border-color: #198754 !important;
    color: white !important;
  }
  .approve-kyc-btn:hover:not(:disabled) svg {
    color: white !important;
  }
  .reject-kyc-btn:hover:not(:disabled) {
    background-color: #dc3545 !important;
    border-color: #dc3545 !important;
    color: white !important;
  }
  .reject-kyc-btn:hover:not(:disabled) svg {
    color: white !important;
  }
`;

const KYCDashboard = () => {
  const [kycData, setKycData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiApprovedKYCs, setApiApprovedKYCs] = useState(new Set());
  const [apiRejectedKYCs, setApiRejectedKYCs] = useState(new Set());
  const itemsPerPage = 10;

  useEffect(() => {
    fetchKYCData();

    // Add the styles to the document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const fetchKYCData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Making API request to fetch KYC data...');
      
      const response = await API.get('/api/v1/web/kyc/', {
        headers: {
          'Authorization': `Token 7b257e1452f1115b0c70f80a1d54ccd8615aa52c`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response:', response);

      // The response is already in the correct format with results array
      if (response && response.results) {
        setKycData(response.results);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching KYC data:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message || 
        err.message || 
        'Failed to load KYC data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKYC = async (kycId) => {
    try {
      setApprovingId(kycId);
      setError(null);

      const response = await API.put(`/api/v1/web/verify-kyc/${kycId}/`, {}, {
        headers: {
          'Authorization': `Token 7b257e1452f1115b0c70f80a1d54ccd8615aa52c`
        }
      });
      
      if (response.data?.message === "KYC request approved successfully") {
        setKycData(prev => prev.map(kyc => 
          kyc.id === kycId ? { ...kyc, verify_status: 'approved', is_verify: true } : kyc
        ));
        setApiApprovedKYCs(prev => new Set([...prev, kycId]));
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error('Error approving KYC:', err);
      setError(err.response?.data?.message || err.message || 'Failed to approve KYC. Please try again.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectKYC = async (kycId) => {
    try {
      setRejectingId(kycId);
      setError(null);

      const response = await API.put(`/api/v1/web/reject-kyc/${kycId}/`, {}, {
        headers: {
          'Authorization': `Token 7b257e1452f1115b0c70f80a1d54ccd8615aa52c`
        }
      });

      console.log('Reject KYC Response:', response);
      
      // The response comes directly with the message property
      if (response?.message === "KYC request rejected successfully") {
        // Update the local state to reflect the change
        setKycData(prev => prev.map(kyc => 
          kyc.id === kycId ? { ...kyc, verify_status: 'rejected', is_verify: false } : kyc
        ));
        
        // Update the sets tracking KYC statuses
        setApiRejectedKYCs(prev => new Set([...prev, kycId]));
        setApiApprovedKYCs(prev => {
          const newSet = new Set(prev);
          newSet.delete(kycId);
          return newSet;
        });
      } else {
        throw new Error('Failed to reject KYC');
      }
    } catch (err) {
      console.error('Error rejecting KYC:', err);
      setError(err.response?.message || err.message || 'Failed to reject KYC. Please try again.');
    } finally {
      setRejectingId(null);
    }
  };

  const filteredKYC = () => {
    let filtered = kycData;
    
    // Filter by approval status
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(kyc => !kyc.is_verify);
        break;
      case 'approved':
        filtered = filtered.filter(kyc => kyc.is_verify);
        break;
      default:
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(kyc => 
        kyc.id.toString().includes(query) ||
        (kyc.user?.name || '').toLowerCase().includes(query)
      );
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalFilteredCount = () => {
    let filtered = kycData;
    
    // Filter by approval status
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(kyc => !kyc.is_verify);
        break;
      case 'approved':
        filtered = filtered.filter(kyc => kyc.is_verify);
        break;
      default:
        break;
    }

    return filtered.length;
  };

  const totalPages = Math.ceil(
    (activeTab === 'pending'
      ? kycData.filter(k => !k.is_verify).length
      : activeTab === 'approved'
      ? kycData.filter(k => k.is_verify).length
      : kycData.length) / itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const tableCellStyle = {
    verticalAlign: "middle",
    fontSize: "0.75rem",
    padding: "0.75rem"
  };

  const tableHeaderStyle = {
    ...tableCellStyle,
    fontWeight: 600,
    fontSize: "0.875rem",
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6'
  };

  return (
    <Container fluid className="p-4" style={{ background: "#f8fcf8" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold m-0">KYC Verification Dashboard</h4>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}>
              (Access given by - <span className="fw-medium text-dark">God Admin</span>)
            </span>
          </div>
          <p className="text-muted small m-0">Manage user KYC verifications</p>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <Nav 
          variant="tabs" 
          activeKey={activeTab}
          onSelect={(k) => {
            setActiveTab(k);
            setCurrentPage(1);
          }}
          style={{ flex: '1' }}
        >
          <Nav.Item>
            <Nav.Link 
              eventKey="all"
              className="px-4"
              style={{ 
                fontWeight: activeTab === 'all' ? '600' : '400',
                color: activeTab === 'all' ? '#0d6efd' : '#666',
                fontSize: '0.75rem'
              }}
            >
              All KYCs
              <Badge bg="secondary" className="ms-2">
                {getTotalFilteredCount()}
              </Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              eventKey="pending"
              className="px-4"
              style={{ 
                fontWeight: activeTab === 'pending' ? '600' : '400',
                color: activeTab === 'pending' ? '#0d6efd' : '#666',
                fontSize: '0.75rem'
              }}
            >
              Pending Approval
              <Badge bg="warning" text="dark" className="ms-2">
                {kycData.filter(k => !k.is_verify).length}
              </Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              eventKey="approved"
              className="px-4"
              style={{ 
                fontWeight: activeTab === 'approved' ? '600' : '400',
                color: activeTab === 'approved' ? '#0d6efd' : '#666',
                fontSize: '0.75rem'
              }}
            >
              Approved
              <Badge bg="success" className="ms-2">
                {kycData.filter(k => k.is_verify).length}
              </Badge>
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <div className="mx-4" style={{ flex: '0 0 300px' }}>
          <InputGroup size="sm">
            <InputGroup.Text 
              style={{ 
                backgroundColor: 'white',
                borderRight: 'none',
                padding: '0.5rem 0.75rem'
              }}
            >
              <FiSearch size={14} color="#666" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by ID..."
              value={searchQuery}
              onChange={handleSearch}
              style={{ 
                fontSize: '0.75rem',
                borderLeft: 'none',
                boxShadow: 'none',
                paddingLeft: '0.25rem'
              }}
            />
          </InputGroup>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading KYC data...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded shadow-sm">
            <Table responsive bordered hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={tableHeaderStyle}>S.No</th>
                  <th style={tableHeaderStyle}>User</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Created Date</th>
                  <th style={tableHeaderStyle}>Updated Date</th>
                  <th style={tableHeaderStyle}>Documents</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredKYC().map((kyc, index) => (
                  <tr key={kyc.id}>
                    <td style={tableCellStyle}>
                      {((currentPage - 1) * itemsPerPage) + index + 1}
                    </td>
                    <td style={tableCellStyle}>
                      <div className="d-flex align-items-center gap-2">
                        {kyc.self_image ? (
                          <img 
                            src={kyc.self_image} 
                            alt="Profile" 
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #e9ecef'
                            }}
                          />
                        ) : (
                          <div 
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#e9ecef',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              color: '#6c757d'
                            }}
                          >
                            NA
                          </div>
                        )}
                        <span style={{ fontSize: '0.75rem' }}>
                          {kyc.user?.name || 'Not Available'}
                        </span>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <Badge 
                        bg={kyc.is_verify ? "success" : "warning"} 
                        text={kyc.is_verify ? "light" : "dark"} 
                        style={{ 
                          fontSize: '0.7rem', 
                          padding: '0.4em 0.7em',
                          fontWeight: '500'
                        }}
                      >
                        {kyc.verify_status || (kyc.is_verify ? "Approved" : "Pending")}
                      </Badge>
                    </td>
                    <td style={tableCellStyle}>{formatDate(kyc.date_created)}</td>
                    <td style={tableCellStyle}>{formatDate(kyc.date_updated)}</td>
                    <td style={tableCellStyle}>
                      {kyc.aadhar_front && (
                        <a
                          href={kyc.aadhar_front}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-3 text-decoration-none"
                          style={{ color: '#0d6efd', fontSize: '0.75rem' }}
                        >
                          Aadhar Front
                        </a>
                      )}
                      {kyc.aadhar_back && (
                        <a
                          href={kyc.aadhar_back}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-3 text-decoration-none"
                          style={{ color: '#0d6efd', fontSize: '0.75rem' }}
                        >
                          Aadhar Back
                        </a>
                      )}
                      {kyc.video && (
                        <a
                          href={kyc.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-3 text-decoration-none"
                          style={{ color: '#0d6efd', fontSize: '0.75rem' }}
                        >
                          Video
                        </a>
                      )}
                      {kyc.paper_cutting1 && (
                        <a
                          href={kyc.paper_cutting1}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-3 text-decoration-none"
                          style={{ color: '#0d6efd', fontSize: '0.75rem' }}
                        >
                          Paper Cutting 1
                        </a>
                      )}
                      {kyc.paper_cutting2 && (
                        <a
                          href={kyc.paper_cutting2}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-3 text-decoration-none"
                          style={{ color: '#0d6efd', fontSize: '0.75rem' }}
                        >
                          Paper Cutting 2
                        </a>
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      <div className="d-flex gap-2">
                        {apiApprovedKYCs.has(kyc.id) || kyc.is_verify ? (
                          <BootstrapButton
                            variant="success"
                            size="sm"
                            disabled
                            style={{ 
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.5rem',
                              opacity: 1
                            }}
                          >
                            <FiCheckCircle className="me-1" style={{ width: '0.7rem', height: '0.7rem' }} />
                            KYC Approved
                          </BootstrapButton>
                        ) : (
                          <BootstrapButton
                            variant="light"
                            size="sm"
                            onClick={() => handleApproveKYC(kyc.id)}
                            disabled={approvingId === kyc.id || rejectingId === kyc.id || apiRejectedKYCs.has(kyc.id)}
                            className="approve-kyc-btn"
                            style={{ 
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.5rem',
                              border: '1px solid #dee2e6',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {approvingId === kyc.id ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-1"
                                  style={{ width: '0.7rem', height: '0.7rem' }}
                                />
                                Approving...
                              </>
                            ) : (
                              <>
                                <FiCheckCircle className="me-1" style={{ width: '0.7rem', height: '0.7rem' }} />
                                Approve KYC
                              </>
                            )}
                          </BootstrapButton>
                        )}

                        {apiRejectedKYCs.has(kyc.id) || kyc.verify_status === 'rejected' ? (
                          <BootstrapButton
                            variant="danger"
                            size="sm"
                            disabled
                            style={{ 
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.5rem',
                              opacity: 1
                            }}
                          >
                            <FiXCircle className="me-1" style={{ width: '0.7rem', height: '0.7rem' }} />
                            KYC Rejected
                          </BootstrapButton>
                        ) : (
                          <BootstrapButton
                            variant="light"
                            size="sm"
                            onClick={() => handleRejectKYC(kyc.id)}
                            disabled={rejectingId === kyc.id || approvingId === kyc.id}
                            className="reject-kyc-btn"
                            style={{ 
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.5rem',
                              border: '1px solid #dee2e6',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {rejectingId === kyc.id ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-1"
                                  style={{ width: '0.7rem', height: '0.7rem' }}
                                />
                                Rejecting...
                              </>
                            ) : (
                              <>
                                <FiXCircle className="me-1" style={{ width: '0.7rem', height: '0.7rem' }} />
                                Reject KYC
                              </>
                            )}
                          </BootstrapButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          <div className="d-flex justify-content-between align-items-center mt-3 px-2">
            <div className="small text-muted">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, 
                activeTab === 'pending'
                  ? kycData.filter(k => !k.is_verify).length
                  : activeTab === 'approved'
                  ? kycData.filter(k => k.is_verify).length
                  : kycData.length
              )} of {
                activeTab === 'pending'
                  ? kycData.filter(k => !k.is_verify).length
                  : activeTab === 'approved'
                  ? kycData.filter(k => k.is_verify).length
                  : kycData.length
              } entries
            </div>
            
            <Pagination className="mb-0">
              <Pagination.First 
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={currentPage === index + 1}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </>
      )}
    </Container>
  );
};

export default KYCDashboard; 