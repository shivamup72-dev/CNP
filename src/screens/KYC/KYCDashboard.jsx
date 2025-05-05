import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Spinner, Alert, Nav, Pagination, Form, InputGroup } from 'react-bootstrap';
import { FiCheckCircle, FiSearch } from 'react-icons/fi';
import API from '../../api/endpoint';
import BootstrapButton from '../../components/common/BootstrapButton';
import { formatDate } from '../../utils/Utility';

const KYCDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [userTypeFilter, setUserTypeFilter] = useState('all'); // 'all', 'political', 'regular'
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Expanded dummy data for KYC verification
  const dummyUsers = [
    // Original 6 entries
    {
      id: 1,
      name: "Rajesh Kumar Sharma",
      email: "rajesh.sharma@gmail.com",
      phone_number: "+91 98765 43210",
      is_political_party: false,
      kyc_submitted_date: "2024-03-20T10:30:00Z",
      kyc_documents: [{ url: "#aadhar" }, { url: "#pan" }],
      is_approved: false
    },
    {
      id: 2,
      name: "Bharatiya Janata Party - Delhi Unit",
      email: "bjp.delhi@party.com",
      phone_number: "+91 99999 88888",
      is_political_party: true,
      kyc_submitted_date: "2024-03-19T15:45:00Z",
      kyc_documents: [{ url: "#registration" }, { url: "#affidavit" }, { url: "#authorization" }],
      is_approved: true
    },
    {
      id: 3,
      name: "Priya Patel",
      email: "priya.patel@yahoo.com",
      phone_number: "+91 87654 32109",
      is_political_party: false,
      kyc_submitted_date: "2024-03-18T09:15:00Z",
      kyc_documents: [{ url: "#aadhar" }, { url: "#pan" }],
      is_approved: true
    },
    {
      id: 4,
      name: "Indian National Congress - Maharashtra",
      email: "inc.maharashtra@party.com",
      phone_number: "+91 77777 66666",
      is_political_party: true,
      kyc_submitted_date: "2024-03-17T14:20:00Z",
      kyc_documents: [{ url: "#registration" }, { url: "#affidavit" }],
      is_approved: false
    },
    {
      id: 5,
      name: "Amit Singh Verma",
      email: "amit.verma@hotmail.com",
      phone_number: "+91 95555 44444",
      is_political_party: false,
      kyc_submitted_date: "2024-03-16T11:20:00Z",
      kyc_documents: [{ url: "#aadhar" }, { url: "#pan" }],
      is_approved: false
    },
    {
      id: 6,
      name: "Aam Aadmi Party - Punjab",
      email: "aap.punjab@party.com",
      phone_number: "+91 88888 55555",
      is_political_party: true,
      kyc_submitted_date: "2024-03-15T16:30:00Z",
      kyc_documents: [{ url: "#registration" }, { url: "#affidavit" }, { url: "#authorization" }],
      is_approved: true
    },
    // Additional entries to reach 23
    {
      id: 7,
      name: "Suresh Mehta",
      email: "suresh.mehta@gmail.com",
      phone_number: "+91 98765 43220",
      is_political_party: false,
      kyc_submitted_date: "2024-03-14T10:30:00Z",
      kyc_documents: [{ url: "#aadhar" }, { url: "#pan" }],
      is_approved: true
    },
    {
      id: 8,
      name: "Samajwadi Party - UP",
      email: "sp.up@party.com",
      phone_number: "+91 99999 77777",
      is_political_party: true,
      kyc_submitted_date: "2024-03-13T15:45:00Z",
      kyc_documents: [{ url: "#registration" }, { url: "#affidavit" }],
      is_approved: false
    },
    {
      id: 9,
      name: "Anita Desai",
      email: "anita.desai@yahoo.com",
      phone_number: "+91 87654 32111",
      is_political_party: false,
      kyc_submitted_date: "2024-03-12T09:15:00Z",
      kyc_documents: [{ url: "#aadhar" }, { url: "#pan" }],
      is_approved: false
    },
    {
      id: 10,
      name: "DMK - Tamil Nadu",
      email: "dmk.tn@party.com",
      phone_number: "+91 77777 66655",
      is_political_party: true,
      kyc_submitted_date: "2024-03-11T14:20:00Z",
      kyc_documents: [{ url: "#registration" }, { url: "#affidavit" }, { url: "#authorization" }],
      is_approved: true
    },
    {
      id: 11,
      name: "Vikram Singh",
      email: "vikram.singh@gmail.com",
      phone_number: "+91 95555 44433",
      is_political_party: false,
      kyc_submitted_date: "2024-03-10T11:20:00Z",
      kyc_documents: [{ url: "#aadhar" }, { url: "#pan" }],
      is_approved: true
    },
    {
      id: 12,
      name: "Shiv Sena - Mumbai",
      email: "shivsena.mumbai@party.com",
      phone_number: "+91 88888 55544",
      is_political_party: true,
      kyc_submitted_date: "2024-03-09T16:30:00Z",
      kyc_documents: [{ url: "#registration" }, { url: "#affidavit" }],
      is_approved: false
    },
    {
      id: 13,
      name: "Meera Reddy",
      email: "meera.reddy@yahoo.com",
      phone_number: "+91 98765 43230",
      is_political_party: false,
      kyc_submitted_date: "2024-03-08T10:30:00Z",
      kyc_documents: [{ url: "#aadhar" }, { url: "#pan" }],
      is_approved: false
    },
    {
      id: 14,
      name: "TDP - Andhra Pradesh",
      email: "tdp.ap@party.com",
      phone_number: "+91 99999 88877",
      is_political_party: true,
      kyc_submitted_date: "2024-03-07T15:45:00Z",
      kyc_documents: [{ url: "#registration" }, { url: "#affidavit" }, { url: "#authorization" }],
      is_approved: true
    },
    {
      id: 15,
      name: "Arjun Malhotra",
      email: "arjun.malhotra@gmail.com",
      phone_number: "+91 87654 32122",
      is_political_party: false,
      kyc_submitted_date: "2024-03-06T09:15:00Z",
      kyc_documents: [{ url: "#aadhar" }, { url: "#pan" }],
      is_approved: true
    },
    {
      id: 16,
      name: "JD(U) - Bihar",
      email: "jdu.bihar@party.com",
      phone_number: "+91 77777 66677",
      is_political_party: true,
      kyc_submitted_date: "2024-03-05T14:20:00Z",
      kyc_documents: [{ url: "#registration" }, { url: "#affidavit" }],
      is_approved: false
    },
    {
      id: 17,
      name: "Neha Gupta",
      email: "neha.gupta@yahoo.com",
      phone_number: "+91 95555 44455",
      is_political_party: false,
      kyc_submitted_date: "2024-03-04T11:20:00Z",
      kyc_documents: [{ url: "#aadhar" }, { url: "#pan" }],
      is_approved: false
    },
    {
      id: 18,
      name: "NCP - Maharashtra",
      email: "ncp.maha@party.com",
      phone_number: "+91 88888 55566",
      is_political_party: true,
      kyc_submitted_date: "2024-03-03T16:30:00Z",
      kyc_documents: [{ url: "#registration" }, { url: "#affidavit" }, { url: "#authorization" }],
      is_approved: true
    },
    {
      id: 19,
      name: "Rahul Joshi",
      email: "rahul.joshi@gmail.com",
      phone_number: "+91 98765 43240",
      is_political_party: false,
      kyc_submitted_date: "2024-03-02T10:30:00Z",
      kyc_documents: [{ url: "#aadhar" }, { url: "#pan" }],
      is_approved: true
    },
    {
      id: 20,
      name: "BJD - Odisha",
      email: "bjd.odisha@party.com",
      phone_number: "+91 99999 88899",
      is_political_party: true,
      kyc_submitted_date: "2024-03-01T15:45:00Z",
      kyc_documents: [{ url: "#registration" }, { url: "#affidavit" }],
      is_approved: false
    },
    {
      id: 21,
      name: "Kavita Sharma",
      email: "kavita.sharma@yahoo.com",
      phone_number: "+91 87654 32133",
      is_political_party: false,
      kyc_submitted_date: "2024-02-29T09:15:00Z",
      kyc_documents: [{ url: "#aadhar" }, { url: "#pan" }],
      is_approved: false
    },
    {
      id: 22,
      name: "TMC - West Bengal",
      email: "tmc.wb@party.com",
      phone_number: "+91 77777 66688",
      is_political_party: true,
      kyc_submitted_date: "2024-02-28T14:20:00Z",
      kyc_documents: [{ url: "#registration" }, { url: "#affidavit" }, { url: "#authorization" }],
      is_approved: true
    },
    {
      id: 23,
      name: "Sanjay Patil",
      email: "sanjay.patil@gmail.com",
      phone_number: "+91 95555 44466",
      is_political_party: false,
      kyc_submitted_date: "2024-02-27T11:20:00Z",
      kyc_documents: [{ url: "#aadhar" }, { url: "#pan" }],
      is_approved: true
    }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(dummyUsers);
    } catch (err) {
      console.error('Error loading dummy data:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKYC = async (userId) => {
    try {
      setApprovingId(userId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_approved: true } : user
      ));
    } catch (err) {
      console.error('Error approving KYC:', err);
      setError('Failed to approve KYC. Please try again.');
    } finally {
      setApprovingId(null);
    }
  };

  const filteredUsers = () => {
    let filtered = users;
    
    // First filter by approval status
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(user => !user.is_approved);
        break;
      case 'approved':
        filtered = filtered.filter(user => user.is_approved);
        break;
      default:
        break;
    }

    // Then filter by user type
    switch (userTypeFilter) {
      case 'political':
        filtered = filtered.filter(user => user.is_political_party);
        break;
      case 'regular':
        filtered = filtered.filter(user => !user.is_political_party);
        break;
      default:
        break;
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone_number.includes(query)
      );
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalFilteredCount = () => {
    let filtered = users;
    
    // Filter by approval status
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(user => !user.is_approved);
        break;
      case 'approved':
        filtered = filtered.filter(user => user.is_approved);
        break;
      default:
        break;
    }

    // Filter by user type
    switch (userTypeFilter) {
      case 'political':
        filtered = filtered.filter(user => user.is_political_party);
        break;
      case 'regular':
        filtered = filtered.filter(user => !user.is_political_party);
        break;
      default:
        break;
    }

    return filtered.length;
  };

  const totalPages = Math.ceil(
    (activeTab === 'pending'
      ? users.filter(u => !u.is_approved).length
      : activeTab === 'approved'
      ? users.filter(u => u.is_approved).length
      : users.length) / itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
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
          <h4 className="fw-bold m-0">KYC Verification Dashboard</h4>
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
              All Users
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
                {users.filter(u => !u.is_approved).length}
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
                {users.filter(u => u.is_approved).length}
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
              placeholder="Search by name, email, or phone..."
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

        <div className="d-flex gap-2">
          <BootstrapButton
            variant={userTypeFilter === 'political' ? 'dark' : 'outline-dark'}
            size="sm"
            onClick={() => {
              setUserTypeFilter(userTypeFilter === 'political' ? 'all' : 'political');
              setCurrentPage(1);
            }}
            style={{ 
              fontSize: '0.75rem',
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem'
            }}
          >
            Political Party
          </BootstrapButton>
          <BootstrapButton
            variant={userTypeFilter === 'regular' ? 'dark' : 'outline-dark'}
            size="sm"
            onClick={() => {
              setUserTypeFilter(userTypeFilter === 'regular' ? 'all' : 'regular');
              setCurrentPage(1);
            }}
            style={{ 
              fontSize: '0.75rem',
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem'
            }}
          >
            Regular User
          </BootstrapButton>
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
          <p className="mt-2">Loading users...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded shadow-sm">
            <Table responsive bordered hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={tableHeaderStyle}>Name</th>
                  <th style={tableHeaderStyle}>Email</th>
                  <th style={tableHeaderStyle}>Phone</th>
                  <th style={tableHeaderStyle}>Type</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Submitted On</th>
                  <th style={tableHeaderStyle}>Documents</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers().map(user => (
                  <tr key={user.id}>
                    <td style={{
                      ...tableCellStyle,
                      fontWeight: user.is_political_party ? 500 : 400
                    }}>{user.name}</td>
                    <td style={tableCellStyle}>{user.email}</td>
                    <td style={tableCellStyle}>{user.phone_number}</td>
                    <td style={tableCellStyle}>
                      <Badge bg={user.is_political_party ? "dark" : "secondary"} style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.4em 0.7em',
                        fontWeight: '500'
                      }}>
                        {user.is_political_party ? "Political Party" : "Regular User"}
                      </Badge>
                    </td>
                    <td style={tableCellStyle}>
                      <Badge 
                        bg={user.is_approved ? "success" : "warning"} 
                        text={user.is_approved ? "light" : "dark"} 
                        style={{ 
                          fontSize: '0.7rem', 
                          padding: '0.4em 0.7em',
                          fontWeight: '500'
                        }}
                      >
                        {user.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </td>
                    <td style={tableCellStyle}>{formatDate(user.kyc_submitted_date)}</td>
                    <td style={tableCellStyle}>
                      {user.kyc_documents?.map((doc, index) => (
                        <a
                          key={index}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-3 text-decoration-none"
                          style={{ 
                            color: '#0d6efd',
                            fontSize: '0.75rem'
                          }}
                        >
                          {user.is_political_party 
                            ? ['Registration', 'Affidavit', 'Authorization'][index]
                            : ['Aadhar Card', 'PAN Card'][index]}
                        </a>
                      ))}
                    </td>
                    <td style={tableCellStyle}>
                      {!user.is_approved && (
                        <BootstrapButton
                          variant="success"
                          size="sm"
                          onClick={() => handleApproveKYC(user.id)}
                          disabled={approvingId === user.id}
                          style={{ 
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem'
                          }}
                        >
                          {approvingId === user.id ? (
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
                  ? users.filter(u => !u.is_approved).length
                  : activeTab === 'approved'
                  ? users.filter(u => u.is_approved).length
                  : users.length
              )} of {
                activeTab === 'pending'
                  ? users.filter(u => !u.is_approved).length
                  : activeTab === 'approved'
                  ? users.filter(u => u.is_approved).length
                  : users.length
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