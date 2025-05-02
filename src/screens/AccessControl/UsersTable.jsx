import React, { useState } from 'react';
import { Table, Badge, Button, Form, InputGroup, Row, Col, Spinner } from 'react-bootstrap';
import { FiEye, FiEdit, FiTrash2, FiSearch, FiUser, FiFlag, FiUsers, FiUserCheck, FiUserPlus } from 'react-icons/fi';
import { FaCheck, FaShareSquare, FaFlag } from 'react-icons/fa';
import UserDetailsModal from '../../components/modals/UserDetailsModal';
import { formatDate } from '../../utils/DateUtility';

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
  onAddUserClick
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
        user.id === userId ? {...user, status: 'approved'} : user
      ));
      setApprovingUserId(null);
    }, 500);
  };

  // Handle repost action
  const handleRepost = (userId) => {
    setRepostingUserId(userId);
    setTimeout(() => {
      setUsers(prev => prev.map(user => 
        user.id === userId ? {...user, isReposted: true} : user
      ));
      setRepostingUserId(null);
    }, 500);
  };

  // Handle flag action
  const handleFlag = (userId) => {
    setFlaggingUserId(userId);
    setTimeout(() => {
      setUsers(prev => prev.map(user => 
        user.id === userId ? {...user, flagged: !user.flagged} : user
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
  const handleDelete = (userId) => {
    setDeletingUserId(userId);
    // TODO: Implement delete functionality
    setTimeout(() => {
      setDeletingUserId(null);
    }, 500);
  };
  
  return (
    <div>
      <Row className="mb-3 align-items-center">
        <Col md={4}>
          <h5 className="fw-bold mb-0">{title}</h5>
        </Col>
        <Col md={4} className="d-flex justify-content-center">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or location"
            value={searchTerm}
            onChange={onSearchChange}
            style={{ maxWidth: "300px" }}
          />
        </Col>
        <Col md={4} className="d-flex flex-column gap-2 align-items-end">
          <div className="d-flex gap-2">
            {isLoadingUsers ? (
              <Button 
                variant="outline-dark" 
                className="d-flex align-items-center"
                size="sm"
                disabled
              >
                <Spinner animation="border" size="sm" className="me-1" />
                <span>Loading...</span>
              </Button>
            ) : (
              <Button
                variant={showUsersList ? "dark" : "outline-dark"}
                className="d-flex align-items-center"
                size="sm"
                onClick={onAllUsersClick}
                disabled={isLoadingAdmins}
              >
                <FiUsers className="me-1" /> All Regular Users
              </Button>
            )}
            
            {isLoadingAdmins ? (
              <Button 
                variant="outline-dark" 
                className="d-flex align-items-center"
                size="sm"
                disabled
              >
                <Spinner animation="border" size="sm" className="me-1" />
                <span>Loading...</span>
              </Button>
            ) : (
              <Button
                variant={showAdminsList ? "dark" : "outline-dark"}
                className="d-flex align-items-center"
                size="sm"
                onClick={onAllAdminsClick}
                disabled={isLoadingUsers}
              >
                <FiUserCheck className="me-1" /> All Admins
              </Button>
            )}
          </div>
          
          <Button
            variant="dark"
            className="d-flex align-items-center"
            size="sm"
            style={{ 
              backgroundColor: "#000", 
              borderColor: "#000",
              padding: "0.5rem 1rem"
            }}
            onClick={onAddUserClick}
          >
            <FiUserPlus className="me-1" /> Add New User or Admin
          </Button>
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
                    <div style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                      fontSize: "0.75rem"
                    }}>
                      {user.lastActive ? formatDate(user.lastActive) : 'N/A'}
                    </div>
                  </td>
                  <td style={lastCellStyle}>
                    <div className="d-flex gap-2 justify-content-center">
                      {user.role && user.role !== "user" ? (
                        <>
                          {/* Approve Button */}
                          <Button
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
                          </Button>

                          {/* Repost Button */}
                          <Button
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
                          </Button>

                          {/* Flag Button */}
                          <Button
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
                          </Button>

                          {/* Edit Button */}
                          <Button
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
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="light"
                            size="sm"
                            className="d-flex justify-content-center align-items-center"
                            style={{ width: "28px", height: "28px", padding: "0" }}
                            onClick={() => handleDelete(user.id)}
                            disabled
                            title="Delete User"
                          >
                            <FiTrash2 style={{
                              color: "#6c757d",
                              fontSize: "0.8rem"
                            }} />
                          </Button>
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