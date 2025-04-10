import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Badge, Tabs, Tab, Nav, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiArrowLeft,
  FiEdit,
  FiTrash,
  FiUserPlus,
  FiEye,
  FiFlag,
  FiShield,
  FiGlobe,
  FiMapPin,
  FiLayers,
  FiUser,
  FiUserCheck,
  FiFileText,
  FiImage
} from "react-icons/fi";
import "../../assets/css/Dashboard.css";

const AccessControl = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [activeRole, setActiveRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [postsData, setPostsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample users data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Arun Kumar",
      email: "arun@example.com",
      role: "ground_zero",
      location: "Delhi",
      status: "active",
      lastActive: "2023-06-01",
      accessLevel: 1
    },
    {
      id: 2,
      name: "Rajesh Singh",
      email: "rajesh@example.com",
      role: "city_manager",
      location: "Mumbai",
      status: "active",
      lastActive: "2023-06-02",
      accessLevel: 2
    },
    {
      id: 3,
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "state_manager",
      location: "Bangalore",
      status: "active",
      lastActive: "2023-06-03",
      accessLevel: 3
    },
    {
      id: 4,
      name: "Vikram Patel",
      email: "vikram@example.com",
      role: "national_manager",
      location: "Delhi",
      status: "active",
      lastActive: "2023-06-04",
      accessLevel: 4
    },
    {
      id: 5,
      name: "Ananya Das",
      email: "ananya@example.com",
      role: "god_admin",
      location: "Chennai",
      status: "active",
      lastActive: "2023-06-05",
      accessLevel: 5
    }
  ]);

  // Function to fetch posts data from API
  const fetchPostsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Add Authorization header with the token
      const headers = {
        'Authorization': 'Token 7b257e1452f1115b0c70f80a1d54ccd8615aa52c'
      };
      
      const response = await fetch('https://stage.suniyenetajee.com/api/v1/web/posts/?status=all&page=1&page_size=100', { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPostsData(data);
      setActiveTab("posts");
    } catch (e) {
      console.error("Error fetching posts:", e);
      // Handle 404 errors specially
      if (e.message.includes("404")) {
        setError("No data available for this page. There aren't enough posts to fill this many pages.");
      } else {
        setError(`Failed to fetch posts: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Role display mapping
  const roleDisplayMap = {
    "ground_zero": "Ground Zero Reporter",
    "city_manager": "City Manager",
    "state_manager": "State Manager",
    "national_manager": "National Manager",
    "god_admin": "God Admin"
  };

  // Role description mapping
  const roleDescriptions = {
    "ground_zero": "Can view posts from their Zila only. Can view flagged & deleted posts with reasons only of their zila. Cannot edit or delete posts.",
    "city_manager": "Can view both Ground Zero & City posts. Can view flagged & deleted posts with reasons only of their zila and city. Cannot edit or delete posts.",
    "state_manager": "Can view Ground Zero, City & State posts. Can view flagged & deleted posts with reasons only of their zila, city and state, not of others city or state. Cannot edit or delete posts.",
    "national_manager": "Can view Ground Zero, City, State & National posts. Can view flagged & deleted posts with reasons of all city, state, zila everything. As part of the core team, they can edit and delete users posts but not admin posts.",
    "god_admin": "Can view all 5 level's posts. Can view flagged & deleted posts with reasons of all city, state, zila everything. Has full control of adding, editing & deleting all posts of users & admins. Can delete users and admin accounts if needed."
  };

  // Filter users based on selected role and search term
  const filteredUsers = users.filter(user => {
    const matchesRole = activeRole === "all" || user.role === activeRole;
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesSearch;
  });

  // Role badge color mapping
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ground_zero": return "secondary";
      case "city_manager": return "info";
      case "state_manager": return "primary";
      case "national_manager": return "warning";
      case "god_admin": return "danger";
      default: return "secondary";
    }
  };

  // Role icon mapping 
  const getRoleIcon = (role) => {
    const iconStyle = {
    };

    switch (role) {
      case "ground_zero": return <span style={iconStyle}><FiMapPin /></span>;
      case "city_manager": return <span style={iconStyle}><FiLayers /></span>;
      case "state_manager": return <span style={iconStyle}><FiGlobe /></span>;
      case "national_manager": return <span style={iconStyle}><FiShield /></span>;
      case "god_admin": return <span style={iconStyle}><FiUser /></span>;
      default: return <span style={iconStyle}><FiUser /></span>;
    }
  };

  // Format ISO date to readable format
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container fluid className="p-4" style={{
      background: "linear-gradient(to bottom, #f8fcf8 0%, #f8fcf8 100%)",
      minHeight: "100vh"
    }}>
      {/* Header with back button */}
      <div className="d-flex align-items-center mb-4">
        <Button
          variant="light"
          className="me-3 rounded-circle p-2 d-flex align-items-center justify-content-center"
          style={{ 
            width: "40px", 
            height: "40px", 
            backgroundColor: "#ffffff", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)" 
          }}
          onClick={() => navigate("/dashboard")}
        >
          <FiArrowLeft />
        </Button>
        <div>
          <h4 className="fw-bold m-0">Access Control Center</h4>
          <p className="text-muted small m-0">Manage user roles and permissions</p>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Nav
        variant="tabs"
        className="mb-4"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
      >
        <Nav.Item>
          <Nav.Link eventKey="users" className="d-flex align-items-center">
            <FiUsers className="me-2" /> Users & Roles
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="permissions" className="d-flex align-items-center">
            <FiShield className="me-2" /> Permission Levels
          </Nav.Link>
        </Nav.Item>
        {postsData && (
          <Nav.Item>
            <Nav.Link eventKey="posts" className="d-flex align-items-center">
              <FiFileText className="me-2" /> Posts
            </Nav.Link>
          </Nav.Item>
        )}
      </Nav>

      {/* Posts Tab */}
      {activeTab === "posts" && postsData && (
        <>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">All Posts</h5>
                <div className="d-flex gap-2">
                  <span className="text-muted">Total: {postsData.count}</span>
                  {postsData.next && (
                    <Button variant="outline-primary" size="sm">
                      Load More
                    </Button>
                  )}
                </div>
              </div>
              
              {loading && <div className="text-center py-3">Loading posts...</div>}
              {error && <Alert variant="danger">{error}</Alert>}
              
              {!loading && !error && (
                <div className="table-responsive">
                  <Table hover className="table-bordered">
                    <thead>
                      <tr>
                        <th className="border-end" style={{width: "5%"}}>#</th>
                        <th className="border-end" style={{width: "15%"}}>Date</th>
                        <th className="border-end" style={{width: "30%"}}>Post</th>
                        <th className="border-end" style={{width: "20%"}}>Author</th>
                        <th className="border-end" style={{width: "15%"}}>Media</th>
                        <th style={{width: "15%"}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {postsData.results.map(post => (
                        <tr key={post.id}>
                          <td className="border-end">{post.id}</td>
                          <td className="border-end">{formatDate(post.date_created)}</td>
                          <td className="border-end">
                            {post.description ? post.description : <span className="text-muted">No description</span>}
                            <div className="mt-1">
                              <Badge 
                                bg={post.status === "approved" ? "success" : "warning"} 
                                className="text-capitalize"
                              >
                                {post.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="border-end">
                            <div className="d-flex align-items-center">
                              {post.created_by.picture ? (
                                <img 
                                  src={`https://stage.suniyenetajee.com${post.created_by.picture}`} 
                                  alt={post.created_by.full_name}
                                  className="rounded-circle me-2"
                                  style={{width: "30px", height: "30px", objectFit: "cover"}}
                                />
                              ) : (
                                <div 
                                  className="rounded-circle me-2 bg-secondary d-flex align-items-center justify-content-center"
                                  style={{width: "30px", height: "30px"}}
                                >
                                  <FiUser color="white" size={16} />
                                </div>
                              )}
                              <div>
                                <div className="fw-semibold small">{post.created_by.full_name}</div>
                                <div className="text-muted" style={{fontSize: "0.75rem"}}>ID: {post.created_by.user_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="border-end">
                            {post.media && post.media.length > 0 ? (
                              <div className="d-flex align-items-center">
                                <FiImage className="me-2" />
                                <span>{post.media.length} media item{post.media.length !== 1 ? 's' : ''}</span>
                              </div>
                            ) : (
                              <span className="text-muted">No media</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-dark"
                                size="sm"
                                title="View Details"
                              >
                                <FiEye />
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                title="Edit Post"
                              >
                                <FiEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                title="Delete Post"
                              >
                                <FiTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {postsData.results.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            No posts found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}

      {/* Users & Roles Tab */}
      {activeTab === "users" && (
        <>
          {/* Role filter and search */}
          <Row className="mb-4 align-items-end">
            <Col md={4} xs={12} className="mb-3 mb-md-0">
              <label className="form-label">Filter by Role</label>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant={activeRole === "all" ? "dark" : "outline-dark"}
                  size="sm"
                  onClick={() => setActiveRole("all")}
                  className="d-flex align-items-center"
                >
                  <FiUsers className="me-1" /> All
                </Button>
                <Button
                  variant={activeRole === "ground_zero" ? "dark" : "outline-dark"}
                  size="sm"
                  onClick={() => setActiveRole("ground_zero")}
                  className="d-flex align-items-center"
                >
                  <FiMapPin className="me-1" /> Ground Zero Reporter
                </Button>
                <Button
                  variant={activeRole === "city_manager" ? "dark" : "outline-dark"}
                  size="sm"
                  onClick={() => setActiveRole("city_manager")}
                  className="d-flex align-items-center"
                >
                  <FiLayers className="me-1" /> City Manager
                </Button>
                <Button
                  variant={activeRole === "state_manager" ? "dark" : "outline-dark"}
                  size="sm"
                  onClick={() => setActiveRole("state_manager")}
                  className="d-flex align-items-center"
                >
                  <FiGlobe className="me-1" /> State Manager
                </Button>
                <Button
                  variant={activeRole === "national_manager" ? "dark" : "outline-dark"}
                  size="sm"
                  onClick={() => setActiveRole("national_manager")}
                  className="d-flex align-items-center"
                  style={{
                    whiteSpace: "normal",
                    textAlign: "left",
                    minHeight: "38px",
                    height: "auto",
                    padding: "4px 8px"
                  }}
                >
                  <FiShield className="me-1 flex-shrink-0" /> National Manager (Demi God)
                </Button>
                <Button
                  variant={activeRole === "god_admin" ? "dark" : "outline-dark"}
                  size="sm"
                  onClick={() => setActiveRole("god_admin")}
                  className="d-flex align-items-center"
                >
                  <FiUser className="me-1" /> God Admin
                </Button>
              </div>
            </Col>
            <Col md={4} xs={12} className="mb-3 mb-md-0">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, or location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={4} xs={12} className="d-flex flex-column justify-content-md-end align-items-md-end">
              <div className="d-flex gap-2 mb-2 w-100 justify-content-md-end">
                <Button
                  variant="outline-dark"
                  className="d-flex align-items-center flex-grow-1 flex-md-grow-0"
                  size="sm"
                  onClick={fetchPostsData}
                >
                  <FiFileText className="me-1" /> All Posts
                </Button>
                <Button
                  variant="outline-dark"
                  className="d-flex align-items-center flex-grow-1 flex-md-grow-0"
                  size="sm"
                >
                  <FiUsers className="me-1" /> All Users
                </Button>
                <Button
                  variant="outline-dark"
                  className="d-flex align-items-center flex-grow-1 flex-md-grow-0"
                  size="sm"
                >
                  <FiUserCheck className="me-1" /> All Admins
                </Button>
              </div>
              <Button
                variant="dark"
                className="d-flex align-items-center"
                style={{ backgroundColor: "#000", borderColor: "#000" }}
              >
                <FiUserPlus className="me-2" /> Add New User or Admin
              </Button>
            </Col>
          </Row>

          {/* Users Table */}
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="table-bordered">
                  <thead>
                    <tr>
                      <th className="border-end">Name</th>
                      <th className="border-end">Email</th>
                      <th className="border-end">Role</th>
                      <th className="border-end">Location</th>
                      <th className="border-end">Status</th>
                      <th className="border-end">Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td className="border-end">{user.name}</td>
                        <td className="border-end">{user.email}</td>
                        <td className="border-end">
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
                            {getRoleIcon(user.role)} {user.role === "national_manager" ? <span style={{ marginLeft: "2px" }}>{roleDisplayMap[user.role]}</span> : roleDisplayMap[user.role]}
                          </Badge>
                        </td>
                        <td className="border-end">{user.location}</td>
                        <td className="border-end">
                          <Badge
                            bg={user.status === "active" ? "success" : "secondary"}
                            className="text-capitalize"
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="border-end">{user.lastActive}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-dark"
                              size="sm"
                              title="View"
                            >
                              <FiEye />
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              title="Edit"
                              disabled={user.role !== "god_admin" && user.role !== "national_manager"}
                              style={{
                                opacity: user.role !== "god_admin" && user.role !== "national_manager" ? 0.5 : 1,
                                backgroundColor: user.role !== "god_admin" && user.role !== "national_manager" ? "#f5f5f5" : "",
                                borderColor: user.role !== "god_admin" && user.role !== "national_manager" ? "#e0e0e0" : "",
                                color: user.role !== "god_admin" && user.role !== "national_manager" ? "#9e9e9e" : ""
                              }}
                            >
                              <FiEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              title={user.role === "god_admin" ? "Delete User/Admin" : user.role === "national_manager" ? "Delete User Only" : "Delete (Restricted)"}
                              disabled={user.role !== "god_admin" && user.role !== "national_manager"}
                              style={{
                                opacity: user.role !== "god_admin" && user.role !== "national_manager" ? 0.5 : 1,
                                backgroundColor: user.role !== "god_admin" && user.role !== "national_manager" ? "#f5f5f5" : "",
                                borderColor: user.role !== "god_admin" && user.role !== "national_manager" ? "#e0e0e0" : "",
                                color: user.role !== "god_admin" && user.role !== "national_manager" ? "#9e9e9e" : ""
                              }}
                            >
                              <FiTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No users found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Permission Levels Tab */}
      {activeTab === "permissions" && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Body>
                <h5 className="fw-bold mb-3">Access Control Hierarchy</h5>
                <p className="text-muted">The application follows a hierarchical access control system where higher levels have access to all lower level content.</p>

                <Alert variant="info" className="d-flex align-items-center">
                  <FiUserCheck className="me-2 flex-shrink-0" size={20} />
                  <div>
                    <strong>Important:</strong> Each role inherits all viewing permissions from lower roles. Edit permissions are limited to specific roles.
                  </div>
                </Alert>
              </Card.Body>
            </Card>

            {/* Role descriptions */}
            <Row>
              {/* Level 1: Ground Zero Reporter */}
              <Col md={6} className="mb-4">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-3 p-2 bg-secondary bg-opacity-10 rounded-circle">
                        <FiMapPin size={24} className="text-secondary" />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0">Level 1: Ground Zero Reporter</h5>
                        <div className="text-muted small">Basic access level</div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p>{roleDescriptions["ground_zero"]}</p>
                    </div>
                    <div className="mt-auto">
                      <div className="fw-bold mb-2">Access to:</div>
                      <ul className="list-unstyled">
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> Zila (District) level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> Flagged & deleted posts (Zila level only)
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-danger">✗</span> City level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-danger">✗</span> State level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-danger">✗</span> National level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-danger">✗</span> Edit posts
                        </li>
                        <li className="d-flex align-items-center">
                          <span className="me-2 text-danger">✗</span> Delete posts
                        </li>
                      </ul>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Level 2: City Manager */}
              <Col md={6} className="mb-4">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-3 p-2 bg-info bg-opacity-10 rounded-circle">
                        <FiLayers size={24} className="text-info" />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0">Level 2: City Manager</h5>
                        <div className="text-muted small">Intermediate access level</div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p>{roleDescriptions["city_manager"]}</p>
                    </div>
                    <div className="mt-auto">
                      <div className="fw-bold mb-2">Access to:</div>
                      <ul className="list-unstyled">
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> Zila (District) level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> City level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> Flagged & deleted posts (Zila and City level only)
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-danger">✗</span> State level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-danger">✗</span> National level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-danger">✗</span> Edit posts
                        </li>
                        <li className="d-flex align-items-center">
                          <span className="me-2 text-danger">✗</span> Delete posts
                        </li>
                      </ul>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Level 3: State Manager */}
              <Col md={6} className="mb-4">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-3 p-2 bg-primary bg-opacity-10 rounded-circle">
                        <FiGlobe size={24} className="text-primary" />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0">Level 3: State Manager</h5>
                        <div className="text-muted small">Advanced access level</div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p>{roleDescriptions["state_manager"]}</p>
                    </div>
                    <div className="mt-auto">
                      <div className="fw-bold mb-2">Access to:</div>
                      <ul className="list-unstyled">
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> Zila (District) level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> City level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> State level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> Flagged & deleted posts (Zila, City and State level only)
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-danger">✗</span> National level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-danger">✗</span> Edit posts
                        </li>
                        <li className="d-flex align-items-center">
                          <span className="me-2 text-danger">✗</span> Delete posts
                        </li>
                      </ul>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Level 4: National Manager */}
              <Col md={6} className="mb-4">
                <Card className="shadow-sm border-0 h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-3 p-2 bg-warning bg-opacity-10 rounded-circle">
                        <FiShield size={24} className="text-warning" />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0">National Manager (Demi God)</h5>
                        <div className="text-muted small">Core team access level</div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p>{roleDescriptions["national_manager"]}</p>
                    </div>
                    <div className="mt-auto">
                      <div className="fw-bold mb-2">Access to:</div>
                      <ul className="list-unstyled">
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> Zila (District) level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> City level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> State level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> National level posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> Flagged & deleted posts (all levels)
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> Edit user posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-success">✓</span> Delete user posts
                        </li>
                        <li className="d-flex align-items-center">
                          <span className="me-2 text-danger">✗</span> Edit/delete admin posts
                        </li>
                      </ul>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Level 5: God Admin */}
              <Col md={12}>
                <Card className="shadow-sm border-0 h-100 border-danger border-opacity-25">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-3 p-2 bg-danger bg-opacity-10 rounded-circle">
                        <FiUser size={24} className="text-danger" />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0">God Admin</h5>
                        <div className="text-muted small">Full system access</div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p>{roleDescriptions["god_admin"]}</p>
                    </div>
                    <div className="mt-auto">
                      <div className="fw-bold mb-2">Access to:</div>
                      <div className="row">
                        <div className="col-md-6">
                          <ul className="list-unstyled">
                            <li className="d-flex align-items-center mb-2">
                              <span className="me-2 text-success">✓</span> Zila (District) level posts
                            </li>
                            <li className="d-flex align-items-center mb-2">
                              <span className="me-2 text-success">✓</span> City level posts
                            </li>
                            <li className="d-flex align-items-center mb-2">
                              <span className="me-2 text-success">✓</span> State level posts
                            </li>
                            <li className="d-flex align-items-center mb-2">
                              <span className="me-2 text-success">✓</span> National level posts
                            </li>
                            <li className="d-flex align-items-center mb-2">
                              <span className="me-2 text-success">✓</span> Flagged & deleted posts (all levels)
                            </li>
                          </ul>
                        </div>
                        <div className="col-md-6">
                          <ul className="list-unstyled">
                            <li className="d-flex align-items-center mb-2">
                              <span className="me-2 text-success">✓</span> Edit all posts (users & admins)
                            </li>
                            <li className="d-flex align-items-center mb-2">
                              <span className="me-2 text-success">✓</span> Delete all posts (users & admins)
                            </li>
                            <li className="d-flex align-items-center mb-2">
                              <span className="me-2 text-success">✓</span> Create/edit users & admins
                            </li>
                            <li className="d-flex align-items-center mb-2">
                              <span className="me-2 text-success">✓</span> Delete users & admins
                            </li>
                            <li className="d-flex align-items-center">
                              <span className="me-2 text-success">✓</span> Full system administration
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AccessControl; 