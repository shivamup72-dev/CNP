import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Button, Table, Badge, Tabs, Tab, Nav, Alert, Pagination } from "react-bootstrap";
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
import PostSection from "../Dashboard/postSection/PostSection.jsx";
import "../../assets/css/Dashboard.css";
import { formatDate } from "../../utils/DateUtility";

const AccessControl = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [activeRole, setActiveRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [postsData, setPostsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPostsPage, setCurrentPostsPage] = useState(1);
  const [approvedPostIds, setApprovedPostIds] = useState([]);
  const [formattedPosts, setFormattedPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");

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
  const fetchPostsData = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      // Add Authorization header with the token
      const headers = {
        'Authorization': 'Token 7b257e1452f1115b0c70f80a1d54ccd8615aa52c'
      };

      // Determine the API URL based on the activeFilter
      let apiUrl = `https://stage.suniyenetajee.com/api/v1/web/posts?status=all`;

      if (activeFilter === "pending") {
        apiUrl = `https://stage.suniyenetajee.com/api/v1/web/posts?status=pending`;
      }

      console.log(`Fetching posts with ${activeFilter} filter using URL: ${apiUrl}`);

      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('API Response:', data);

      // Format the posts for PostSection component
      const formattedPosts = data.results.map(post => ({
        id: post.id.toString(),
        title: post.description || post.message || "No title",
        content: post.description || post.message || "No content",
        author: post.user?.name || post.created_by?.full_name || "Unknown",
        date: formatDate(post.date_created),
        date_created: post.date_created,
        flagged: post.flagged || false,
        post_status: post.status || "pending",
        image: post.media && post.media.length ? API.getImageUrl(post.media[0].media) : post.image || null
      }));

      setFormattedPosts(formattedPosts);

      // Extract approved post IDs
      const approvedIds = data.results
        .filter(post => post.status === "approved")
        .map(post => post.id);
      setApprovedPostIds(approvedIds);

      setPostsData(data);
      setCurrentPostsPage(page);
      setTotalPages(Math.max(1, Math.ceil(data.count / 100)));
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
    "national_manager": "Can view Ground Zero, City, State & National posts. Can view flagged & deleted posts with reasons of all city, state, zila everything. Cannot edit or delete posts.",
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

  // Handle page change for post review component
  const handlePageChange = (page) => {
    console.log(`Changing to page ${page}`);
    fetchPostsData(page);
    // Scroll to top of the table when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle filter change for post review component
  const handleFilterChange = (filter) => {
    console.log("Access Control: Changing filter to:", filter);
    setActiveFilter(filter);

    // Determine the API URL based on the filter
    let apiUrl = `https://stage.suniyenetajee.com/api/v1/web/posts?status=all`;

    if (filter === "pending") {
      apiUrl = `https://stage.suniyenetajee.com/api/v1/web/posts?status=pending`;
    }

    console.log(`Fetching posts with ${filter} filter using URL: ${apiUrl}`);

    // Reset to page 1 when changing filters
    const headers = {
      'Authorization': 'Token 7b257e1452f1115b0c70f80a1d54ccd8615aa52c'
    };

    fetch(apiUrl, { headers })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(`Fetched ${data.count} posts`);

        // Format the posts
        const formattedPosts = data.results.map(post => ({
          id: post.id.toString(),
          title: post.description || post.message || "No title",
          content: post.description || post.message || "No content",
          author: post.user?.name || post.created_by?.full_name || "Unknown",
          date: formatDate(post.date_created),
          date_created: post.date_created,
          flagged: post.flagged || false,
          post_status: post.status || "pending",
          image: post.media && post.media.length ? API.getImageUrl(post.media[0].media) : post.image || null
        }));

        setFormattedPosts(formattedPosts);

        // Extract approved post IDs
        const approvedIds = data.results
          .filter(post => post.status === "approved")
          .map(post => post.id);
        setApprovedPostIds(approvedIds);

        setPostsData(data);
        setCurrentPostsPage(1);
        setTotalPages(Math.max(1, Math.ceil(data.count / 100)));
        setActiveTab("posts");
      })
      .catch(error => {
        console.error("Error fetching posts:", error);
      });
  };

  // Handle post updates
  const handlePostsUpdate = (updatedPosts) => {
    console.log("Access Control: Updating posts:", updatedPosts);
    setFormattedPosts(updatedPosts);
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
            <Card.Body className="p-0">
              {loading && (
                <div className="text-center py-5">
                  {/* Loading spinner removed as requested */}
                </div>
              )}

              {error && <Alert variant="danger" className="m-3">{error}</Alert>}

              {!loading && !error && postsData && formattedPosts && (
                <PostSection
                  posts={formattedPosts}
                  setPosts={handlePostsUpdate}
                  currentPage={currentPostsPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalPosts={postsData.count}
                  approvedPosts={approvedPostIds}
                  setApprovedPosts={setApprovedPostIds}
                  activeFilter={activeFilter}
                  onFilterChange={handleFilterChange}
                  inDashboard={true}
                />
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
                  onClick={() => {
                    // Reset to page 1, set filter to "all", and fetch all posts
                    setActiveFilter("all");
                    console.log("All Posts button clicked - fetching all posts");

                    // Use the explicit API call with status=all
                    const headers = {
                      'Authorization': 'Token 7b257e1452f1115b0c70f80a1d54ccd8615aa52c'
                    };

                    fetch(`https://stage.suniyenetajee.com/api/v1/web/posts?status=all`, { headers })
                      .then(response => {
                        if (!response.ok) {
                          throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                      })
                      .then(data => {
                        console.log(`Fetched ${data.count} posts`);

                        // Format the posts
                        const formattedPosts = data.results.map(post => ({
                          id: post.id.toString(),
                          title: post.description || post.message || "No title",
                          content: post.description || post.message || "No content",
                          author: post.user?.name || post.created_by?.full_name || "Unknown",
                          date: formatDate(post.date_created),
                          date_created: post.date_created,
                          flagged: post.flagged || false,
                          post_status: post.status || "pending",
                          image: post.media && post.media.length ? API.getImageUrl(post.media[0].media) : post.image || null
                        }));

                        setFormattedPosts(formattedPosts);

                        // Extract approved post IDs
                        const approvedIds = data.results
                          .filter(post => post.status === "approved")
                          .map(post => post.id);
                        setApprovedPostIds(approvedIds);

                        setPostsData(data);
                        setCurrentPostsPage(1);
                        setTotalPages(Math.max(1, Math.ceil(data.count / 100)));
                        setActiveTab("posts");
                      })
                      .catch(error => {
                        console.error("Error fetching posts:", error);
                      });
                  }}
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
                              disabled={user.role !== "god_admin"}
                              style={{
                                opacity: user.role !== "god_admin" ? 0.5 : 1,
                                backgroundColor: user.role !== "god_admin" ? "#f5f5f5" : "",
                                borderColor: user.role !== "god_admin" ? "#e0e0e0" : "",
                                color: user.role !== "god_admin" ? "#9e9e9e" : ""
                              }}
                            >
                              <FiEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              title={user.role === "god_admin" ? "Delete User/Admin" : "Delete (Restricted)"}
                              disabled={user.role !== "god_admin"}
                              style={{
                                opacity: user.role !== "god_admin" ? 0.5 : 1,
                                backgroundColor: user.role !== "god_admin" ? "#f5f5f5" : "",
                                borderColor: user.role !== "god_admin" ? "#e0e0e0" : "",
                                color: user.role !== "god_admin" ? "#9e9e9e" : ""
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
                          <span className="me-2 text-danger">✗</span> Edit user posts
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <span className="me-2 text-danger">✗</span> Delete user posts
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