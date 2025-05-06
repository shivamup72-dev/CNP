import React, { useState, useEffect } from 'react';
import { Table, Badge, Form, InputGroup, Row, Col, Spinner, Modal, Alert } from 'react-bootstrap';
import { FiEye, FiEdit, FiTrash2, FiSearch, FiUser, FiFlag, FiUsers, FiUserCheck, FiUserPlus, FiX } from 'react-icons/fi';
import { FaCheck, FaShareSquare, FaFlag } from 'react-icons/fa';
import UserDetailsModal from '../../components/modals/UserDetailsModal';
import { formatDate } from '../../utils/Utility';
import BootstrapButton from '../../components/common/BootstrapButton';
import API from '../../api/endpoint';

const styles = `
  .delete-user-btn:hover:not(:disabled) {
    background-color: #dc3545 !important;
    border-color: #dc3545 !important;
    color: white !important;
  }
  .delete-user-btn:hover:not(:disabled) svg {
    color: white !important;
  }
`;

const UsersTable = ({
  users,
  setUsers,
  getRoleBadgeColor,
  getRoleIcon,
  roleDisplayMap,
  title = "All Users",
  searchTerm,
  onSearchChange,
  showUsersList,
  showAdminsList,
  isLoadingUsers,
  isLoadingAdmins,
  onAllUsersClick,
  onAllAdminsClick,
  onAddUserClick,
  onDeletedUsersClick
}) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [approvingUserId, setApprovingUserId] = useState(null);
  const [repostingUserId, setRepostingUserId] = useState(null);
  const [flaggingUserId, setFlaggingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [error, setError] = useState(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [deactivationError, setDeactivationError] = useState(null);

  // Common table cell style for consistency
  const tableCellStyle = {
    verticalAlign: "middle",
    borderRight: "1px solid #e0e0e0",
    borderBottom: "1px solid #e0e0e0",
    padding: "0.4rem 0.5rem",
    fontSize: "0.75rem"
  };

  const firstCellStyle = {
    ...tableCellStyle,
    borderLeft: "1px solid #e0e0e0"
  };

  const lastCellStyle = {
    verticalAlign: "middle",
    borderBottom: "1px solid #e0e0e0",
    borderRight: "1px solid #e0e0e0",
    padding: "0.4rem",
    fontSize: "0.75rem"
  };

  // Table header style
  const tableHeaderStyle = {
    ...tableCellStyle,
    fontSize: "0.85rem",
    fontWeight: "bold",
    borderTop: "1px solid #e0e0e0"
  };

  const firstHeaderStyle = {
    ...tableHeaderStyle,
    borderLeft: "1px solid #e0e0e0"
  };

  const lastHeaderStyle = {
    ...tableHeaderStyle,
    borderRight: "1px solid #e0e0e0"
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.location.toLowerCase().includes(searchLower) ||
      roleDisplayMap[user.role]?.toLowerCase().includes(searchLower)
    );
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle special cases
    if (sortField === 'role') {
      aValue = roleDisplayMap[a.role] || a.role;
      bValue = roleDisplayMap[b.role] || b.role;
    }

    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle sort header click
  const handleSortClick = (field) => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set it and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return <span className="ms-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  // Render role badge with proper handling for empty roles
  const renderRoleBadge = (user) => {
    // If user has no role or role is "user", render as regular user
    if (!user.role || user.role === "user") {
      return (
        <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: "11.2px" }}>
          <FiUser /> Regular User
        </div>
      );
    }

    // Otherwise render the badge as before
    return (
      <Badge
        bg={getRoleBadgeColor(user.role)}
        className={`d-flex align-items-center ${user.role === "national_manager" ? "gap-0" : "gap-1"} w-100`}
        style={{
          maxWidth: user.role === "national_manager" ? "150px" : "150px",
          whiteSpace: user.role === "national_manager" ? "normal" : "nowrap",
          height: user.role === "national_manager" ? "auto" : "",
          padding: user.role === "national_manager" ? "5px 8px" : "",
          lineHeight: user.role === "national_manager" ? "1" : "",
          fontSize: "11.2px",
          backgroundColor: (user.role === "ground_zero" || user.role === "ground_zero_reporter") ? "#9370DB" : undefined,
          color: (user.role === "ground_zero" || user.role === "ground_zero_reporter") ? "#fff" : undefined
        }}
      >
        {getRoleIcon(user.role)} {user.role === "national_manager" ? (
          <span style={{ marginLeft: "2px" }}>{roleDisplayMap[user.role]}</span>
        ) : roleDisplayMap[user.role]}
      </Badge>
    );
  };

  // Handle approve action
  const handleApproveUser = (userId) => {
    setApprovingUserId(userId);
    setTimeout(() => {
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, status: 'approved' } : user
      ));
      setApprovingUserId(null);
    }, 500);
  };

  // Handle repost action
  const handleRepost = (userId) => {
    setRepostingUserId(userId);
    setTimeout(() => {
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, isReposted: true } : user
      ));
      setRepostingUserId(null);
    }, 500);
  };

  // Handle flag action
  const handleFlag = (userId) => {
    setFlaggingUserId(userId);
    setTimeout(() => {
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, flagged: !user.flagged } : user
      ));
      setFlaggingUserId(null);
    }, 500);
  };

  // Handle user click to show details
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  // Handle edit action
  const handleEdit = (userId) => {
    setEditingUserId(userId);
    // TODO: Implement edit functionality
    setTimeout(() => {
      setEditingUserId(null);
    }, 500);
  };

  // Handle delete action
  const handleDelete = async () => {
    if (!userToDeactivate) return;
    
    try {
      setDeletingUserId(userToDeactivate.id);
      setDeactivationError(null);

      const formData = new FormData();
      // If user is inactive, we'll reactivate them, otherwise deactivate them
      formData.append('status', userToDeactivate.status === 'inactive' ? 'active' : 'inactive');

      console.log('Making API request with:', {
        url: `/api/v1/web/inactive-user/${userToDeactivate.id}/`,
        formData: Object.fromEntries(formData.entries())
      });

      await API.post(`/api/v1/web/inactive-user/${userToDeactivate.id}/`, formData, {
        headers: {
          'Authorization': `Token 7b257e1452f1115b0c70f80a1d54ccd8615aa52c`
        }
      }).then(response => {
        console.log('Confirm Deletion API Response:', response);
        // Update the user's status
        setUsers(prev => prev.map(user => 
          user.id === userToDeactivate.id 
            ? { ...user, status: user.status === 'inactive' ? 'active' : 'inactive' } 
            : user
        ));
        setShowDeactivateModal(false);
        setUserToDeactivate(null);
      }).catch(error => {
        console.error('API Error:', error);
        throw error;
      });

    } catch (err) {
      console.error('Error updating user status:', err);
      setDeactivationError(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        err.message || 
        'Failed to update user status. Please try again.'
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  const resetForm = () => {
    setShowDeactivateModal(false);
    setUserToDeactivate(null);
    setDeactivationError(null);
  };

  useEffect(() => {
    // Add the styles to the document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div>
      <Row className="mb-3 align-items-center">
        <Col md={3}>
          <h5 className="fw-bold mb-0">{title}</h5>
        </Col>
        <Col md={4}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or location"
            value={searchTerm}
            onChange={onSearchChange}
            style={{ maxWidth: "300px" }}
          />
        </Col>
        <Col md={5} className="d-flex justify-content-end gap-2">
          {isLoadingUsers ? (
            <BootstrapButton
              variant="outline-dark"
              className="d-flex align-items-center"
              size="sm"
              disabled
            >
              <Spinner animation="border" size="sm" className="me-1" />
              <span>Loading...</span>
            </BootstrapButton>
          ) : (
            <BootstrapButton
              variant={showUsersList ? "dark" : "outline-dark"}
              className="d-flex align-items-center"
              size="sm"
              onClick={onAllUsersClick}
              disabled={isLoadingAdmins}
            >
              <FiUsers className="me-1" /> All Regular Users
            </BootstrapButton>
          )}

          {isLoadingAdmins ? (
            <BootstrapButton
              variant="outline-dark"
              className="d-flex align-items-center"
              size="sm"
              disabled
            >
              <Spinner animation="border" size="sm" className="me-1" />
              <span>Loading...</span>
            </BootstrapButton>
          ) : (
            <BootstrapButton
              variant={showAdminsList ? "dark" : "outline-dark"}
              className="d-flex align-items-center"
              size="sm"
              onClick={onAllAdminsClick}
              disabled={isLoadingUsers}
            >
              <FiUserCheck className="me-1" /> All Admins
            </BootstrapButton>
          )}

          <BootstrapButton
            variant="outline-danger"
            className="d-flex align-items-center"
            size="sm"
            onClick={onDeletedUsersClick}
            disabled={isLoadingUsers || isLoadingAdmins}
          >
            <FiTrash2 className="me-1" /> Deleted Users
          </BootstrapButton>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col className="d-flex justify-content-end">
          <BootstrapButton
            variant="dark"
            className="d-flex align-items-center justify-content-center"
            size="sm"
            style={{
              backgroundColor: "#000",
              borderColor: "#000",
              padding: "0.5rem 2.5rem",
              minWidth: "250px",
              width: "fit-content"
            }}
            onClick={onAddUserClick}
          >
            <FiUserPlus className="me-2" /> Add New User or Admin
          </BootstrapButton>
        </Col>
      </Row>

      <div className="table-responsive" style={{ marginTop: "2rem" }}>
        <Table hover responsive className="mb-0" style={{
          border: "none",
          margin: 0
        }}>
          <thead>
            <tr>
              <th style={{ ...firstHeaderStyle, width: "4%", cursor: "pointer" }}
                onClick={() => handleSortClick('id')}>
                Sr. No. {renderSortIndicator('id')}
              </th>
              <th style={{ ...tableHeaderStyle, width: "15%", cursor: "pointer" }}
                onClick={() => handleSortClick('name')}>
                Name {renderSortIndicator('name')}
              </th>
              <th style={{ ...tableHeaderStyle, width: "15%", cursor: "pointer" }}
                onClick={() => handleSortClick('email')}>
                Email {renderSortIndicator('email')}
              </th>
              <th style={{ ...tableHeaderStyle, width: "15%", cursor: "pointer" }}
                onClick={() => handleSortClick('role')}>
                Role {renderSortIndicator('role')}
              </th>
              <th style={{ ...tableHeaderStyle, width: "12%", cursor: "pointer" }}
                onClick={() => handleSortClick('location')}>
                Location {renderSortIndicator('location')}
              </th>
              <th style={{ ...tableHeaderStyle, width: "10%", cursor: "pointer" }}
                onClick={() => handleSortClick('status')}>
                Status {renderSortIndicator('status')}
              </th>
              <th style={{ ...tableHeaderStyle, width: "12%", cursor: "pointer" }}
                onClick={() => handleSortClick('lastActive')}>
                Last Active {renderSortIndicator('lastActive')}
              </th>
              <th style={{ ...tableHeaderStyle, width: "8%", cursor: "pointer" }}
                onClick={() => handleSortClick('delete')}>
                Deactivate {renderSortIndicator('delete')}
              </th>
              <th style={{ ...lastHeaderStyle, width: "10%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">No users found matching your search criteria</td>
              </tr>
            ) : (
              sortedUsers.map((user, index) => (
                <tr key={user.id}>
                  <td style={firstCellStyle}>{index + 1}</td>
                  <td style={tableCellStyle}>
                    <div
                      className="d-flex align-items-center"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleUserClick(user)}
                    >
                      <div
                        className="rounded-circle overflow-hidden flex-shrink-0"
                        style={{
                          width: "32px",
                          height: "32px",
                          minWidth: "32px",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundImage: user.picture ? `url(${user.picture})` : "none",
                          backgroundColor: user.picture ? "transparent" : "#e9ecef",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid #dee2e6",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          marginRight: "8px"
                        }}
                      >
                        {!user.picture && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#6c757d" className="bi bi-person" viewBox="0 0 16 16" style={{ display: "block" }}>
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                          </svg>
                        )}
                      </div>
                      <div style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "calc(100% - 40px)"
                      }}>
                        {user.name}
                      </div>
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() => handleUserClick(user)}
                    >
                      {user.email}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    {renderRoleBadge(user)}
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%"
                    }}>
                      {user.location}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <Badge
                      bg={user.status === "active" ? "success" : "secondary"}
                      className="text-capitalize"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td style={tableCellStyle}>
                    {user.lastActive ? formatDate(user.lastActive) : 'Never'}
                  </td>
                  <td style={tableCellStyle}>
                    <BootstrapButton
                      variant={user.status === 'inactive' ? "danger" : "light"}
                      size="sm"
                      onClick={() => {
                        setUserToDeactivate(user);
                        setShowDeactivateModal(true);
                      }}
                      disabled={deletingUserId === user.id}
                      className={user.status === 'inactive' ? "" : "delete-user-btn"}
                      style={{ 
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.5rem',
                        border: '1px solid #dee2e6',
                        transition: 'all 0.2s ease',
                        opacity: 1,
                        cursor: 'pointer'
                      }}
                    >
                      {deletingUserId === user.id ? (
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
                          {user.status === 'inactive' ? 'Activating...' : 'Deactivating...'}
                        </>
                      ) : user.status === 'inactive' ? (
                        <>
                          <FiX className="me-1" style={{ width: '0.7rem', height: '0.7rem' }} />
                          Click to Activate
                        </>
                      ) : (
                        <>
                          <FiTrash2 className="me-1" style={{ width: '0.7rem', height: '0.7rem' }} />
                          Deactivate
                        </>
                      )}
                    </BootstrapButton>
                  </td>
                  <td style={lastCellStyle}>
                    <div className="d-flex gap-2 justify-content-center">
                      {user.role && user.role !== "user" ? (
                        <>
                          {/* Approve Button */}
                          <BootstrapButton
                            variant="light"
                            size="sm"
                            className="d-flex justify-content-center align-items-center"
                            style={{ width: "28px", height: "28px", padding: "0" }}
                            onClick={() => handleApproveUser(user.id)}
                            disabled
                            title="Approve User"
                          >
                            <FaCheck style={{
                              color: "#6c757d",
                              fontSize: "0.8rem"
                            }} />
                          </BootstrapButton>

                          {/* Repost Button */}
                          <BootstrapButton
                            variant="light"
                            size="sm"
                            className="d-flex justify-content-center align-items-center"
                            style={{ width: "28px", height: "28px", padding: "0" }}
                            onClick={() => handleRepost(user.id)}
                            disabled
                            title="Repost"
                          >
                            <FaShareSquare style={{
                              color: "#adb5bd",
                              fontSize: "0.8rem"
                            }} />
                          </BootstrapButton>

                          {/* Flag Button */}
                          <BootstrapButton
                            variant="light"
                            size="sm"
                            className="d-flex justify-content-center align-items-center"
                            style={{ width: "28px", height: "28px", padding: "0" }}
                            onClick={() => handleFlag(user.id)}
                            disabled
                            title="Flag User"
                          >
                            <FiFlag
                              style={{
                                color: "#6c757d",
                                fontSize: "0.8rem"
                              }}
                            />
                          </BootstrapButton>

                          {/* Edit Button */}
                          <BootstrapButton
                            variant="light"
                            size="sm"
                            className="d-flex justify-content-center align-items-center"
                            style={{ width: "28px", height: "28px", padding: "0" }}
                            onClick={() => handleEdit(user.id)}
                            disabled
                            title="Edit User"
                          >
                            <FiEdit style={{
                              color: "#6c757d",
                              fontSize: "0.8rem"
                            }} />
                          </BootstrapButton>
                        </>
                      ) : (
                        <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                          No actions available
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Deactivation Confirmation Modal */}
      <Modal
        show={showDeactivateModal}
        onHide={() => {
          setShowDeactivateModal(false);
          setUserToDeactivate(null);
          setDeactivationError(null);
        }}
        centered
      >
        <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '0.7rem' }}>
          <Modal.Title style={{ fontSize: '1.1rem' }}>
            {userToDeactivate?.status === 'inactive' ? 'Confirm Activation' : 'Confirm Deactivation'}
          </Modal.Title>
          <BootstrapButton
            variant="dark"
            onClick={() => {
              setShowDeactivateModal(false);
              setUserToDeactivate(null);
              setDeactivationError(null);
            }}
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '0.25rem',
              minWidth: 'auto',
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000',
              border: 'none'
            }}
          >
            <FiX size={20} color="white" />
          </BootstrapButton>
        </Modal.Header>
        <Modal.Body style={{ paddingTop: '0.5rem' }}>
          {deactivationError ? (
            <Alert variant="danger" className="mb-0">
              {deactivationError}
            </Alert>
          ) : (
            <p className="mb-0">
              Are you sure you want to {userToDeactivate?.status === 'inactive' ? 'activate' : 'deactivate'} <strong>{userToDeactivate?.name}</strong>?
              {userToDeactivate?.status !== 'inactive' && (
                <>
                  <br />
                  <span className="text-danger" style={{ fontSize: '0.875rem' }}>
                    This action cannot be undone.
                  </span>
                </>
              )}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: 'none', paddingTop: '1rem' }}>
          <BootstrapButton
            variant="light"
            size="sm"
            onClick={() => {
              setShowDeactivateModal(false);
              setUserToDeactivate(null);
              setDeactivationError(null);
            }}
          >
            Cancel
          </BootstrapButton>
          <BootstrapButton
            variant={userToDeactivate?.status === 'inactive' ? "success" : "danger"}
            size="sm"
            onClick={handleDelete}
            disabled={deletingUserId !== null}
          >
            {deletingUserId !== null ? (
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
                {userToDeactivate?.status === 'inactive' ? 'Activating...' : 'Deactivating...'}
              </>
            ) : (
              userToDeactivate?.status === 'inactive' ? 'Activate User' : 'Deactivate User'
            )}
          </BootstrapButton>
        </Modal.Footer>
      </Modal>

      {/* User Details Modal */}
      <UserDetailsModal
        show={showUserDetails}
        onHide={() => setShowUserDetails(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersTable; 