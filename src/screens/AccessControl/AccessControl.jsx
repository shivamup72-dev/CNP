import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Button, Table, Badge, Tabs, Tab, Nav, Alert, Pagination, Spinner, Toast, ToastContainer } from "react-bootstrap";
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
  FiImage,
  FiCheckCircle
} from "react-icons/fi";
import PostSection from "../Dashboard/postSection/PostSection.jsx";
import API from "../../api/endpoint";
import "../../assets/css/Dashboard.css";
import { formatDate } from "../../utils/DateUtility";
import CreateUserOrAdminModal from '../../components/modals/CreateUserOrAdminModal';
import UsersTable from './UsersTable';

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
  const [shouldShowInterimData, setShouldShowInterimData] = useState(true);

  // Modal states
  const [showCreateUserOrAdminModal, setShowCreateUserOrAdminModal] = useState(false);
  
  // Success message state
  const [userCreationSuccess, setUserCreationSuccess] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotalCount, setUsersTotalCount] = useState(0);

  const [showUsersList, setShowUsersList] = useState(false);
  const [showAdminsList, setShowAdminsList] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [usersLoadError, setUsersLoadError] = useState(null);
  const [adminsLoadError, setAdminsLoadError] = useState(null);

  // Function to fetch users from API
  const fetchUsers = async (page = 1) => {
    setUsersLoading(true);
    setUsersError(null);

    try {
      const limit = 10;
      const offset = (page - 1) * limit;
      const apiUrl = `/api/v1/web/users/?limit=${limit}&offset=${offset}`;

      console.log(`[ACCESS CONTROL] Fetching users from: ${apiUrl}`);
      
      const data = await API.get(apiUrl);
      console.log(`[ACCESS CONTROL] Users response:`, data);

      // Format the users data
      const formattedUsers = data.results.map(userObj => ({
        id: userObj.id,
        name: `${userObj.user.first_name} ${userObj.user.last_name}`,
        email: userObj.user.email,
        username: userObj.user.username,
        role: determineUserRole(userObj),
        location: userObj.district ? userObj.district.name : (userObj.state ? userObj.state.name : "Unknown"),
        status: "active",
        lastActive: new Date().toISOString().split('T')[0],
        phone: userObj.phone_number,
        picture: userObj.picture,
        gender: userObj.gender,
        dob: userObj.date_of_birth,
        accessLevel: calculateAccessLevel(userObj)
      }));

      setUsers(formattedUsers);
      setUsersTotalCount(data.count);
      setUsersTotalPages(Math.ceil(data.count / limit));
      setCurrentUsersPage(page);
    } catch (error) {
      console.error("[ACCESS CONTROL] Error fetching users:", error);
      setUsersError("Failed to fetch users. Please try again.");
    } finally {
      setUsersLoading(false);
    }
  };

  // Helper function to determine user role from API data
  const determineUserRole = (userObj) => {
    // This is a placeholder logic - adjust based on your actual API data structure
    // For now, we'll return a sample role
    // In a real scenario, you would extract role information from the API response
    const roles = ["ground_zero", "city_manager", "state_manager", "national_manager", "god_admin"];
    const roleIndex = userObj.id % 5; // Simple way to distribute roles for demonstration
    return roles[roleIndex];
  };

  // Helper function to calculate access level based on role
  const calculateAccessLevel = (userObj) => {
    const role = determineUserRole(userObj);
    const accessLevels = {
      "god_admin": 5,
      "national_manager": 4,
      "state_manager": 3,
      "city_manager": 2,
      "ground_zero": 1
    };
    return accessLevels[role] || 0;
  };

  // Load users when component mounts
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  // Function to fetch posts data from API
  const fetchPostsData = async (page = 1, search = "", showLoader = true) => {
    // Preserve the search term even during API calls
    if (search && search.trim()) {
      window.currentSearchTerm = search;
    }
    
    // Only show loading if it's a deliberate loader request or explicit search
    if (showLoader || window.isDeliberateSearch) {
      setLoading(true);
      // Hide interim data while loading new data
      setShouldShowInterimData(false);
    }
    
    setError(null);
    try {
      // API URL with status filter and search if provided
      let apiUrl = `${API.ENDPOINTS.POSTS}?status=${activeFilter}`;
      
      // Add search parameter if provided
      if (search && search.trim()) {
        apiUrl += `&search=${encodeURIComponent(search)}`;
        console.log(`[ACCESS CONTROL] Searching with term: "${search}"`);
      }

      console.log(`[ACCESS CONTROL] Fetching posts with status: ${activeFilter}`);
      console.log(`[ACCESS CONTROL] Request URL: ${apiUrl}`);
      
      const data = await API.get(apiUrl);
      console.log(`[ACCESS CONTROL] Response:`, data);

      // Format the posts for PostSection component with correct post_status and flagged properties
      const formattedPosts = data.results.map(post => ({
        id: post.id.toString(),
        title: post.description || post.message || "No title",
        content: post.description || post.message || "No content",
        author: post.user?.name || post.created_by?.full_name || "Unknown",
        date: formatDate(post.date_created),
        date_created: post.date_created,
        flagged: post.post_status === "red_flag" || post.flagged || false,
        isDeleted: post.post_status === "rejected" || post.isDeleted || false,
        post_status: post.post_status || post.status,
        image: post.media && post.media.length ? API.getImageUrl(post.media[0].media) : null,
        authorImage: post.created_by?.picture ? API.getImageUrl(post.created_by.picture) : null
      }));

      setFormattedPosts(formattedPosts);

      // Set approved post IDs directly from API response
      const approvedIds = data.results.map(post => post.id);
      setApprovedPostIds(approvedIds);

      setPostsData(data);
      setCurrentPostsPage(page);
      setTotalPages(Math.max(1, Math.ceil(data.count / 100)));
      setActiveTab("posts");
      
      // Now that we have data, allow it to be shown
      setShouldShowInterimData(true);
    } catch (e) {
      console.error("[ACCESS CONTROL] Error fetching posts:", e);
      // Handle 404 errors specially
      if (e.message.includes("404")) {
        setError("No data available for this page. There aren't enough posts to fill this many pages.");
      } else {
        setError(`Failed to fetch posts: ${e.message}`);
      }
    } finally {
      // Reset the deliberate search flag
      window.isDeliberateSearch = false;
      
      if (showLoader) {
        setLoading(false);
      } else {
        // Add a small delay to make sure the UI doesn't flicker
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
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
      (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesRole && matchesSearch;
  });

  // Role badge color mapping
  const getRoleBadgeColor = (role) => {
    if (!role) return "light"; // Light gray for regular users without roles
    
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

    if (!role) return <span style={iconStyle}><FiUser /></span>; // Default user icon for regular users
    
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
    console.log(`[ACCESS CONTROL] Changing filter to: ${filter}`);
    setActiveFilter(filter);
    
    // Log additional info for debugging
    if (filter === "flagged") {
      console.log(`[ACCESS CONTROL] Changing to flagged posts filter`);
    } else if (filter === "deleted") {
      console.log(`[ACCESS CONTROL] Changing to deleted posts filter`);
    }
    
    // Use the fetchPostsData function directly with the current search term
    fetchPostsData(1, searchTerm);
  };

  // Handle post updates
  const handlePostsUpdate = (updatedPosts) => {
    console.log("Access Control: Updating posts:", updatedPosts);
    setFormattedPosts(updatedPosts);
  };

  // Search posts function to handle search term updates
  const searchPosts = (term, filter) => {
    console.log("Access Control: Search term received:", term);
    
    // Always store the current search term to preserve it
    window.currentSearchTerm = term;
    
    // Clear any existing timers to prevent multiple API calls
    if (window.accessControlSearchTimer) {
      clearTimeout(window.accessControlSearchTimer);
    }
    
    // Set a timer to wait until user stops typing
    window.accessControlSearchTimer = setTimeout(() => {
      console.log(`Access Control: User finished typing "${term}", now searching...`);
      
      // Set a flag to indicate we're intentionally searching
      window.isDeliberateSearch = true;
      
      // Now trigger the API call
      fetchPostsData(1, term, false);
    }, 500); // Wait half a second after typing stops
  };

  // Handle user creation
  const handleCreateUser = (userData, successMessage) => {
    console.log("Creating new user with data:", userData);
    
    // After successful creation, refresh the users list
    fetchUsers(1);
    
    // Close the modal
    setShowCreateUserOrAdminModal(false);

    // Set success message
    setUserCreationSuccess(successMessage || `User ${userData.first_name} ${userData.last_name} created successfully!`);
    setShowSuccessToast(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
  };

  // Handle users pagination
  const handleUsersPageChange = (page) => {
    fetchUsers(page);
  };

  // Function to fetch all users
  const fetchAllUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setUsersLoadError(null);
      setShowAdminsList(false); // Hide admin list when showing all users
      
      await fetchUsers(1);
      
      setShowUsersList(true);
      setActiveTab("users");
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsersLoadError("Failed to load users. Please try again.");
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // Function to fetch only admin users
  const fetchAllAdmins = async () => {
    try {
      setIsLoadingAdmins(true);
      setAdminsLoadError(null);
      setShowUsersList(false); // Hide users list when showing admins
      
      await fetchUsers(1);
      
      setShowAdminsList(true);
      setActiveTab("users");
    } catch (error) {
      console.error("Error fetching admins:", error);
      setAdminsLoadError("Failed to load admin users. Please try again.");
    } finally {
      setIsLoadingAdmins(false);
    }
  };
  
  // Function to handle "All Users" button click
  const handleAllUsersClick = () => {
    fetchAllUsers();
  };
  
  // Function to handle "All Admins" button click
  const handleAllAdminsClick = () => {
    fetchAllAdmins();
  };
  
  // Get only regular users (without roles)
  const getRegularUsers = () => {
    // Filter for users without roles
    return users.filter(user => !user.role);
  };
  
  // Get only admin users and users with roles
  const getAdminUsers = () => {
    // Filter for users with roles (any role, not just god_admin)
    return users.filter(user => user.role);
  };

  return (
    <Container fluid className="p-4" style={{
      background: "linear-gradient(to bottom, #f8fcf8 0%, #f8fcf8 100%)",
      minHeight: "100vh"
    }}>
      {/* Toast container for success messages */}
      <ToastContainer 
        className="p-3" 
        position="top-end"
        style={{ 
          zIndex: 1070,
          marginTop: '60px'
        }}
      >
        <Toast 
          show={showSuccessToast} 
          onClose={() => setShowSuccessToast(false)}
          delay={5000}
          autohide
          className="border-0"
          style={{ 
            maxWidth: '250px',
            fontSize: '0.8rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <div className="d-flex align-items-center py-2 px-3" 
            style={{ 
              borderWidth: '4px', 
              borderLeftColor: '#13d378',
              backgroundColor: '#0a8d4c',
              color: 'white'
            }}
          >
            <span className="me-2" style={{ color: 'white' }}>
              <FiCheckCircle size={12} />
            </span>
            <span style={{ color: 'white', fontWeight: '500' }}>{userCreationSuccess}</span>
            <button 
              type="button" 
              className="btn-close btn-close-white ms-auto" 
              style={{ fontSize: '0.6rem', padding: '4px' }}
              onClick={() => setShowSuccessToast(false)}
              aria-label="Close"
            ></button>
          </div>
        </Toast>
      </ToastContainer>

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
                  <p>Loading posts...</p>
                </div>
              )}

              {!loading && postsData && formattedPosts && shouldShowInterimData && (
                <div className="access-control-post-section">
                  <style>
                    {`
                      .access-control-post-section .mb-3.px-2 {
                        margin-top: 15px !important;
                      }
                      .access-control-post-section .mb-3.px-2 input:focus {
                        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                        border-color: #86b7fe;
                        outline: 0;
                      }
                    `}
                  </style>
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
                    error={error}
                    searchPosts={searchPosts}
                  />
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
                  onClick={() => {
                    setActiveRole("all");
                    setShowUsersList(false);
                    setShowAdminsList(false);
                  }}
                  className="d-flex align-items-center"
                >
                  <FiUsers className="me-1" /> All (Users + Admins)
                </Button>
                <Button
                  variant={activeRole === "ground_zero" ? "dark" : "outline-dark"}
                  size="sm"
                  onClick={() => {
                    setActiveRole("ground_zero");
                    setShowUsersList(false);
                    setShowAdminsList(false);
                  }}
                  className="d-flex align-items-center"
                >
                  <FiMapPin className="me-1" /> Ground Zero Reporter (Zila/District)
                </Button>
                <Button
                  variant={activeRole === "city_manager" ? "dark" : "outline-dark"}
                  size="sm"
                  onClick={() => {
                    setActiveRole("city_manager");
                    setShowUsersList(false);
                    setShowAdminsList(false);
                  }}
                  className="d-flex align-items-center"
                >
                  <FiLayers className="me-1" /> City Manager
                </Button>
                <Button
                  variant={activeRole === "state_manager" ? "dark" : "outline-dark"}
                  size="sm"
                  onClick={() => {
                    setActiveRole("state_manager");
                    setShowUsersList(false);
                    setShowAdminsList(false);
                  }}
                  className="d-flex align-items-center"
                >
                  <FiGlobe className="me-1" /> State Manager
                </Button>
                <Button
                  variant={activeRole === "national_manager" ? "dark" : "outline-dark"}
                  size="sm"
                  onClick={() => {
                    setActiveRole("national_manager");
                    setShowUsersList(false);
                    setShowAdminsList(false);
                  }}
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
                  onClick={() => {
                    setActiveRole("god_admin");
                    setShowUsersList(false);
                    setShowAdminsList(false);
                  }}
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
                {/* All Users button */}
                {isLoadingUsers ? (
                  <Button 
                    variant="outline-dark" 
                    className="d-flex align-items-center flex-grow-1 flex-md-grow-0"
                    size="sm"
                    disabled
                  >
                    <Spinner animation="border" size="sm" className="me-1" />
                    <span>Loading...</span>
                  </Button>
                ) : (
                  <Button
                    variant={showUsersList ? "dark" : "outline-dark"}
                    className="d-flex align-items-center flex-grow-1 flex-md-grow-0"
                    size="sm"
                    onClick={handleAllUsersClick}
                    disabled={isLoadingAdmins}
                  >
                    <FiUsers className="me-1" /> All Users
                  </Button>
                )}
                
                {/* All Admins button */}
                {isLoadingAdmins ? (
                  <Button 
                    variant="outline-dark" 
                    className="d-flex align-items-center flex-grow-1 flex-md-grow-0"
                    size="sm"
                    disabled
                  >
                    <Spinner animation="border" size="sm" className="me-1" />
                    <span>Loading...</span>
                  </Button>
                ) : (
                  <Button
                    variant={showAdminsList ? "dark" : "outline-dark"}
                    className="d-flex align-items-center flex-grow-1 flex-md-grow-0"
                    size="sm"
                    onClick={handleAllAdminsClick}
                    disabled={isLoadingUsers}
                  >
                    <FiUserCheck className="me-1" /> All Admins
                  </Button>
                )}
              </div>
              <Button
                variant="dark"
                className="d-flex align-items-center"
                style={{ backgroundColor: "#000", borderColor: "#000" }}
                onClick={() => setShowCreateUserOrAdminModal(true)}
              >
                <FiUserPlus className="me-2" /> Add New User or Admin
              </Button>
            </Col>
          </Row>

          {/* Users loading state */}
          {usersLoading && (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading users...</p>
            </div>
          )}

          {/* Users error message */}
          {usersError && (
            <Alert variant="danger" className="mb-4">
              {usersError}
            </Alert>
          )}

          {/* Users table */}
          {!usersLoading && users.length > 0 && (
            <Card className="shadow-sm border-0">
              <Card.Body>
                <UsersTable 
                  users={filteredUsers}
                  setUsers={setUsers}
                  getRoleBadgeColor={getRoleBadgeColor}
                  getRoleIcon={getRoleIcon}
                  roleDisplayMap={roleDisplayMap}
                  title={activeRole === "all" ? "All Users" : `${roleDisplayMap[activeRole] || activeRole} Users`}
                />
                
                {/* Pagination */}
                {usersTotalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.First 
                        onClick={() => handleUsersPageChange(1)} 
                        disabled={currentUsersPage === 1}
                      />
                      <Pagination.Prev 
                        onClick={() => handleUsersPageChange(currentUsersPage - 1)} 
                        disabled={currentUsersPage === 1}
                      />
                      
                      {Array.from({ length: Math.min(5, usersTotalPages) }).map((_, index) => {
                        let pageNumber;
                        if (usersTotalPages <= 5) {
                          pageNumber = index + 1;
                        } else if (currentUsersPage <= 3) {
                          pageNumber = index + 1;
                        } else if (currentUsersPage >= usersTotalPages - 2) {
                          pageNumber = usersTotalPages - 4 + index;
                        } else {
                          pageNumber = currentUsersPage - 2 + index;
                        }
                        
                        return (
                          <Pagination.Item
                            key={pageNumber}
                            active={pageNumber === currentUsersPage}
                            onClick={() => handleUsersPageChange(pageNumber)}
                          >
                            {pageNumber}
                          </Pagination.Item>
                        );
                      })}
                      
                      <Pagination.Next 
                        onClick={() => handleUsersPageChange(currentUsersPage + 1)} 
                        disabled={currentUsersPage === usersTotalPages}
                      />
                      <Pagination.Last 
                        onClick={() => handleUsersPageChange(usersTotalPages)} 
                        disabled={currentUsersPage === usersTotalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* No users message */}
          {!usersLoading && users.length === 0 && !usersError && (
            <Alert variant="info">
              No users found. Add a new user using the "Add New User or Admin" button.
            </Alert>
          )}
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

      {/* User Creation Modal */}
      <CreateUserOrAdminModal 
        show={showCreateUserOrAdminModal}
        onHide={() => setShowCreateUserOrAdminModal(false)}
        handleCreateUser={handleCreateUser}
      />
    </Container>
  );
};

export default AccessControl; 