import React, { useState } from 'react';
import { Table, Badge, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FiEye, FiEdit, FiTrash, FiSearch } from 'react-icons/fi';

const UsersTable = ({ 
  users, 
  setUsers, 
  getRoleBadgeColor, 
  getRoleIcon, 
  roleDisplayMap,
  title = "All Users"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Common table cell style for consistency
  const tableCellStyle = {
    verticalAlign: "middle",
    borderRight: "1px solid #e0e0e0",
    borderBottom: "1px solid #e0e0e0",
    padding: "0.4rem 0.5rem",
    fontSize: "0.85rem"
  };

  const lastCellStyle = {
    verticalAlign: "middle",
    borderBottom: "1px solid #e0e0e0",
    padding: "0.4rem",
    fontSize: "0.85rem"
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
  
  return (
    <div>
      <Row className="mb-3">
        <Col md={6}>
          <h5 className="fw-bold mb-3">{title}</h5>
        </Col>
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text id="user-search">
              <FiSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>
      
      <div className="table-responsive">
        <Table hover responsive className="mb-0" style={{ border: "none", margin: 0 }}>
          <thead>
            <tr>
              <th 
                style={{ ...tableCellStyle, width: "5%", cursor: "pointer" }}
                onClick={() => handleSortClick('id')}
              >
                ID {renderSortIndicator('id')}
              </th>
              <th 
                style={{ ...tableCellStyle, width: "15%", cursor: "pointer" }}
                onClick={() => handleSortClick('name')}
              >
                Name {renderSortIndicator('name')}
              </th>
              <th 
                style={{ ...tableCellStyle, width: "15%", cursor: "pointer" }}
                onClick={() => handleSortClick('email')}
              >
                Email {renderSortIndicator('email')}
              </th>
              <th 
                style={{ ...tableCellStyle, width: "15%", cursor: "pointer" }}
                onClick={() => handleSortClick('role')}
              >
                Role {renderSortIndicator('role')}
              </th>
              <th 
                style={{ ...tableCellStyle, width: "12%", cursor: "pointer" }}
                onClick={() => handleSortClick('location')}
              >
                Location {renderSortIndicator('location')}
              </th>
              <th 
                style={{ ...tableCellStyle, width: "10%", cursor: "pointer" }}
                onClick={() => handleSortClick('status')}
              >
                Status {renderSortIndicator('status')}
              </th>
              <th 
                style={{ ...tableCellStyle, width: "12%", cursor: "pointer" }}
                onClick={() => handleSortClick('lastActive')}
              >
                Last Active {renderSortIndicator('lastActive')}
              </th>
              <th style={{ ...lastCellStyle, width: "10%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">No users found matching your search criteria</td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
                <tr key={user.id}>
                  <td style={tableCellStyle}>{user.id}</td>
                  <td style={tableCellStyle}>{user.name}</td>
                  <td style={tableCellStyle}>{user.email}</td>
                  <td style={tableCellStyle}>
                    <Badge
                      bg={getRoleBadgeColor(user.role)}
                      className={`d-flex align-items-center ${user.role === "national_manager" ? "gap-0" : "gap-1"} w-100`}
                      style={{
                        maxWidth: user.role === "national_manager" ? "150px" : "150px",
                        whiteSpace: user.role === "national_manager" ? "normal" : "nowrap",
                        height: user.role === "national_manager" ? "auto" : "",
                        padding: user.role === "national_manager" ? "5px 8px" : "",
                        lineHeight: user.role === "national_manager" ? "1" : "",
                        fontSize: "11.2px"
                      }}
                    >
                      {getRoleIcon(user.role)} {user.role === "national_manager" ? (
                        <span style={{ marginLeft: "2px" }}>{roleDisplayMap[user.role]}</span>
                      ) : roleDisplayMap[user.role]}
                    </Badge>
                  </td>
                  <td style={tableCellStyle}>{user.location}</td>
                  <td style={tableCellStyle}>
                    <Badge
                      bg={user.status === "active" ? "success" : "secondary"}
                      className="text-capitalize"
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td style={tableCellStyle}>{user.lastActive}</td>
                  <td style={lastCellStyle}>
                    <div className="d-flex gap-2 justify-content-center">
                      <Button
                        variant="light"
                        size="sm"
                        className="d-flex justify-content-center align-items-center"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        title="View User Details"
                      >
                        <FiEye />
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        className="d-flex justify-content-center align-items-center"
                        style={{ 
                          width: "32px", 
                          height: "32px", 
                          padding: "0",
                          opacity: user.role !== "god_admin" ? 0.5 : 1 
                        }}
                        disabled={user.role !== "god_admin"}
                        title="Edit User"
                      >
                        <FiEdit style={{ color: "#0d6efd" }} />
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        className="d-flex justify-content-center align-items-center"
                        style={{ 
                          width: "32px", 
                          height: "32px", 
                          padding: "0",
                          opacity: user.role !== "god_admin" ? 0.5 : 1 
                        }}
                        disabled={user.role !== "god_admin"}
                        title="Delete User"
                      >
                        <FiTrash style={{ color: "#dc3545" }} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default UsersTable; 