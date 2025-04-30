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

  // Helper to normalize roles from API to match the expected frontend role names
  const normalizeRoleFromAPI = (apiRole) => {
    if (!apiRole) return null;
    
    // Convert to lowercase for consistent comparison
    const lowerRole = apiRole.toLowerCase();
    
    // Map potential variations to our expected role names
    if (lowerRole === "god_admin" || lowerRole === "godadmin" || lowerRole === "god admin") {
      return "god_admin";
    }
    if (lowerRole === "state_manager" || lowerRole === "statemanager" || lowerRole === "state manager") {
      return "state_manager";
    }
    if (lowerRole === "ground_zero" || lowerRole === "groundzero" || lowerRole === "ground zero") {
      return "ground_zero";
    }
    if (lowerRole === "ground_zero_reporter" || lowerRole === "groundzeroreporter" || lowerRole === "ground zero reporter") {
      return "ground_zero_reporter";
    }
    if (lowerRole === "city_manager" || lowerRole === "citymanager" || lowerRole === "city manager") {
      return "city_manager";
    }
    if (lowerRole === "national_manager" || lowerRole === "nationalmanager" || lowerRole === "national manager") {
      return "national_manager";
    }
    
    // Return original if no mapping found
    return apiRole;
  };

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
      
      // ADMIN LOGGING: Log all admin users to console
      console.log("====================");
      console.log("ALL ADMIN USERS DATA");
      console.log("====================");
      
      // Filter to only get users with admin_role
      const allAdmins = data.results.filter(user => user.admin_role);
      
      // Log the total count
      console.log(`Found ${allAdmins.length} admins out of ${data.results.length} total users`);
      
      // Log each admin with their role
      allAdmins.forEach((admin, index) => {
        console.log(`Admin #${index + 1}:`);
        console.log(`- ID: ${admin.id}`);
        console.log(`- Name: ${admin.user.first_name} ${admin.user.last_name}`);
        console.log(`- Email: ${admin.user.email}`);
        console.log(`- Role: ${admin.admin_role} (${typeof admin.admin_role})`);
        console.log(`- Role normalized: ${normalizeRoleFromAPI(admin.admin_role)}`);
        console.log("---");
      });
      
      console.log("Raw admin data:", allAdmins);
      console.log("====================");
      
      // Format the users data
      const formattedUsers = data.results.map(userObj => {
        // Capitalize the first letter of first name and last name
        const firstName = userObj.user.first_name ? 
          userObj.user.first_name.charAt(0).toUpperCase() + userObj.user.first_name.slice(1).toLowerCase() : 
          "";
        
        const lastName = userObj.user.last_name ? 
          userObj.user.last_name.charAt(0).toUpperCase() + userObj.user.last_name.slice(1).toLowerCase() : 
          "";
        
        // Normalize the role from API
        const normalizedRole = normalizeRoleFromAPI(userObj.admin_role);
        
        // Log specific users with state_manager or god_admin roles (case insensitive)
        if (normalizedRole === "state_manager" || normalizedRole === "god_admin") {
          console.log(`[DEBUG] Found user with role ${userObj.admin_role} (normalized: ${normalizedRole}):`, {
            id: userObj.id,
            name: `${firstName} ${lastName}`,
            email: userObj.user.email
          });
        }
        
        return {
          id: userObj.id,
          name: `${firstName} ${lastName}`,
          email: userObj.user.email,
          username: userObj.user.username,
          role: normalizedRole,
          location: userObj.district ? userObj.district.name : (userObj.state ? userObj.state.name : "Unknown"),
          status: "active",
          lastActive: new Date().toISOString().split('T')[0],
          phone: userObj.phone_number,
          picture: userObj.picture,
          gender: userObj.gender,
          dob: userObj.date_of_birth
        };
      });

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
  const determineUserRole = () => {
    // Return null to represent a regular user
    return null;
  };

  // Helper function to calculate access level based on role
  const calculateAccessLevel = () => {
    // Return 0 as default access level
    return 0;
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
    "ground_zero_reporter": "Ground Zero Reporter",
    "city_manager": "City Manager",
    "state_manager": "State Manager",
    "national_manager": "National Manager",
    "god_admin": "God Admin"
  };

  // Role description mapping
  const roleDescriptions = {
    "ground_zero": "Can view posts from their Zila only. Can view flagged & deleted posts with reasons only of their zila. Cannot edit or delete posts.",
    "ground_zero_reporter": "Can view posts from their Zila only. Can view flagged & deleted posts with reasons only of their zila. Cannot edit or delete posts.",
    "city_manager": "Can view both Ground Zero & City posts. Can view flagged & deleted posts with reasons only of their zila and city. Cannot edit or delete posts.",
    "state_manager": "Can view Ground Zero, City & State posts. Can view flagged & deleted posts with reasons only of their zila, city and state, not of others city or state. Cannot edit or delete posts.",
    "national_manager": "Can view Ground Zero, City, State & National posts. Can view flagged & deleted posts with reasons of all city, state, zila everything. Cannot edit or delete posts.",
    "god_admin": "Can view all 5 level's posts. Can view flagged & deleted posts with reasons of all city, state, zila everything. Has full control of adding, editing & deleting all posts of users & admins. Can delete users and admin accounts if needed."
  };

  // Filter users based on selected role and search term
  const filteredUsers = users.filter(user => {
    // Log for debugging
    console.log(`[DEBUG] Filtering user:`, user);
    console.log(`[DEBUG] Active role: ${activeRole}, User role: ${user.role}`);
    
    // Get normalized roles for comparison
    const normalizedUserRole = normalizeRoleFromAPI(user.role);
    const normalizedActiveRole = normalizeRoleFromAPI(activeRole);
    
    // Special debug for god_admin
    if (activeRole === "god_admin") {
      console.log(`[GOD ADMIN DEBUG] Checking user ${user.name}, has role: ${user.role}`);
      console.log(`[GOD ADMIN DEBUG] Normalized: activeRole=${normalizedActiveRole}, userRole=${normalizedUserRole}`);
      console.log(`[GOD ADMIN DEBUG] Direct compare: ${user.role === "god_admin"}`);
      console.log(`[GOD ADMIN DEBUG] Normalized compare: ${normalizedUserRole === "god_admin"}`);
    }
    
    // Filter by role
    let matchesRole = true;
    if (activeRole === "admin") {
      // Show only users with admin roles (excluding "user" role)
      matchesRole = !!user.role && normalizedUserRole !== "user";
    } else if (activeRole === null) {
      // Show only regular users without roles or with "user" role
      matchesRole = !user.role || normalizedUserRole === "user";
    } else if (activeRole !== "all") {
      // Match a specific role
      if (normalizedActiveRole === "ground_zero_reporter" && 
          (normalizedUserRole === "ground_zero" || normalizedUserRole === "ground_zero_reporter")) {
        matchesRole = true;
      } else if (normalizedActiveRole === "ground_zero" && 
                (normalizedUserRole === "ground_zero" || normalizedUserRole === "ground_zero_reporter")) {
        matchesRole = true;
      } else if (normalizedActiveRole === "state_manager" && normalizedUserRole === "state_manager") {
        matchesRole = true;
        console.log(`[DEBUG] Found state_manager: ${user.name}`);
      } else if (normalizedActiveRole === "god_admin" && normalizedUserRole === "god_admin") {
        matchesRole = true;
        console.log(`[DEBUG] Found god_admin: ${user.name}`);
      } else {
        matchesRole = normalizedUserRole === normalizedActiveRole;
      }
    }
    
    // Filter by search term
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const result = matchesRole && matchesSearch;
    console.log(`[DEBUG] User ${user.name} matches: ${result} (role: ${matchesRole}, search: ${matchesSearch})`);
    
    return result;
  });
  
  console.log("[DEBUG] Filtered users count:", filteredUsers.length, "out of", users.length);

  // Role badge color mapping
  const getRoleBadgeColor = (role) => {
    if (!role) return "light"; // Light gray for regular users without roles
    
    switch (role) {
      case "ground_zero": 
      case "ground_zero_reporter": 
        return "custom-ground-zero"; // Custom color for ground zero reporters
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
      case "ground_zero":
      case "ground_zero_reporter": 
        return <span style={iconStyle}><FiMapPin /></span>;
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

    // Set success message - use the message provided by the modal
    setUserCreationSuccess(successMessage);
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
      
      // Use the standard endpoint
      await fetchUsers(1);
      
      // Set filter to show only regular users (without admin roles or with role "user")
      setActiveRole(null); // Use null to indicate regular users only
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
      
      // Use the standard endpoint
      await fetchUsers(1);
      
      // Show only users with admin roles
      setActiveRole("admin"); // Special flag to show admin users
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
    // Filter for users without roles or with "user" role
    return users.filter(user => !user.role || user.role === "user");
  };
  
  // Get only admin users and users with roles
  const getAdminUsers = () => {
    // Filter for users with roles (any role except "user")
    return users.filter(user => user.role && user.role !== "user");
  };

  // Function to handle role filter button clicks
  const handleRoleFilter = async (role) => {
    console.log(`[DEBUG] Setting active role to: ${role}`);
    console.log(`[DEBUG] Before setting - Active role: ${activeRole}, showUsersList: ${showUsersList}, showAdminsList: ${showAdminsList}`);
    
    // Reset other filters
    setShowUsersList(true);
    setShowAdminsList(false);
    setSearchTerm("");
    
    // Set the active role
    setActiveRole(role);
    
    // For specific important roles, let's fetch all users to make sure we have them in our state
    if (role === "god_admin" || role === "state_manager") {
      console.log(`[FETCH ALL] Fetching all users for ${role} filter`);
      setUsersLoading(true);
      
      try {
        // Fetch all users (with a large limit)
        const apiUrl = `/api/v1/web/users/?limit=100&offset=0`;
        console.log(`[FETCH ALL] Fetching users from: ${apiUrl}`);
        
        const data = await API.get(apiUrl);
        console.log(`[FETCH ALL] Retrieved ${data.results.length} users`);
        
        // Check for the specific role
        const matchingUsers = data.results.filter(u => 
          normalizeRoleFromAPI(u.admin_role) === role
        );
        
        console.log(`[FETCH ALL] Found ${matchingUsers.length} users with role "${role}":`, 
          matchingUsers.map(u => ({
            id: u.id,
            name: `${u.user.first_name} ${u.user.last_name}`,
            role: u.admin_role
          }))
        );
        
        // Format the users data
        const formattedUsers = data.results.map(userObj => {
          // Capitalize the first letter of first name and last name
          const firstName = userObj.user.first_name ? 
            userObj.user.first_name.charAt(0).toUpperCase() + userObj.user.first_name.slice(1).toLowerCase() : 
            "";
          
          const lastName = userObj.user.last_name ? 
            userObj.user.last_name.charAt(0).toUpperCase() + userObj.user.last_name.slice(1).toLowerCase() : 
            "";
          
          return {
            id: userObj.id,
            name: `${firstName} ${lastName}`,
            email: userObj.user.email,
            username: userObj.user.username,
            role: normalizeRoleFromAPI(userObj.admin_role),
            location: userObj.district ? userObj.district.name : (userObj.state ? userObj.state.name : "Unknown"),
            status: "active",
            lastActive: new Date().toISOString().split('T')[0],
            phone: userObj.phone_number,
            picture: userObj.picture,
            gender: userObj.gender,
            dob: userObj.date_of_birth
          };
        });
        
        // Update the users state with all users
        setUsers(formattedUsers);
        setUsersTotalCount(data.count);
        setUsersTotalPages(Math.ceil(data.count / 10));
        
      } catch (error) {
        console.error(`[FETCH ALL] Error fetching all users:`, error);
      } finally {
        setUsersLoading(false);
      }
    }
    
    // Special console logging for admins
    console.log("========================");
    console.log(`FILTERING BY ROLE: ${role}`);
    console.log("========================");
    
    // Log the current state after setting
    setTimeout(() => {
      console.log(`[DEBUG] After setting - Active role: ${activeRole}`);
      console.log(`[DEBUG] showUsersList: ${showUsersList}, showAdminsList: ${showAdminsList}`);
    }, 0);
  };

  return (
    <Container fluid className="p-4" style={{
      background: "linear-gradient(to bottom, #f8fcf8 0%, #f8fcf8 100%)",
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
          <div className="d-flex align-items-center" 
            style={{ 
              borderWidth: '4px', 
              borderLeftColor: '#13d378',
              backgroundColor: '#0a8d4c',
              color: 'white',
              padding: '12px 14px'
            }}
          >
            <span className="me-2" style={{ color: 'white' }}>
              <FiCheckCircle size={12} />
            </span>
            <span style={{ color: 'white', fontWeight: '500' }}>{userCreationSuccess}</span>
            <button 
              type="button" 
              className="btn-close btn-close-white ms-auto" 
              style={{ fontSize: '0.6rem', padding: '4px', marginLeft: '8px' }}
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
            <Col md={12} className="mb-3 mb-md-0">
              <label className="form-label">Filter by Role</label>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant={activeRole === "all" ? "dark" : "outline-dark"}
                    size="sm"
                    onClick={() => {
                      handleRoleFilter("all");
                    }}
                    className="d-flex align-items-center"
                  >
                    <FiUsers className="me-1" /> All (Users + Admins)
                  </Button>
                  <Button
                    variant={activeRole === "ground_zero" || activeRole === "ground_zero_reporter" ? "dark" : "outline-dark"}
                    size="sm"
                    onClick={() => {
                      handleRoleFilter("ground_zero_reporter");
                    }}
                    className="d-flex align-items-center"
                  >
                    <FiMapPin className="me-1" /> Ground Zero Reporter (Zila/District)
                  </Button>
                  <Button
                    variant={activeRole === "city_manager" ? "dark" : "outline-dark"}
                    size="sm"
                    onClick={() => {
                      handleRoleFilter("city_manager");
                    }}
                    className="d-flex align-items-center"
                  >
                    <FiLayers className="me-1" /> City Manager
                  </Button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant={activeRole === "state_manager" ? "dark" : "outline-dark"}
                    size="sm"
                    onClick={() => {
                      handleRoleFilter("state_manager");
                    }}
                    className="d-flex align-items-center"
                  >
                    <FiGlobe className="me-1" /> State Manager
                  </Button>
                  <Button
                    variant={activeRole === "national_manager" ? "dark" : "outline-dark"}
                    size="sm"
                    onClick={() => {
                      handleRoleFilter("national_manager");
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
                      handleRoleFilter("god_admin");
                    }}
                    className="d-flex align-items-center"
                  >
                    <FiUser className="me-1" /> God Admin
                  </Button>
                </div>
              </div>
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
            <Card className="shadow-sm" style={{  borderRadius: "0.25rem" }}>
              <Card.Body>
                <UsersTable 
                  users={filteredUsers}
                  setUsers={setUsers}
                  getRoleBadgeColor={getRoleBadgeColor}
                  getRoleIcon={getRoleIcon}
                  roleDisplayMap={roleDisplayMap}
                  title={activeRole === null ? "Regular Users" : 
                         activeRole === "admin" ? "Admin Users" :
                         activeRole === "all" ? "All Users" : 
                         `${roleDisplayMap[activeRole] || activeRole} Users`}
                  searchTerm={searchTerm}
                  onSearchChange={(e) => setSearchTerm(e.target.value)}
                  showUsersList={showUsersList}
                  showAdminsList={showAdminsList}
                  isLoadingUsers={isLoadingUsers}
                  isLoadingAdmins={isLoadingAdmins}
                  onAllUsersClick={handleAllUsersClick}
                  onAllAdminsClick={handleAllAdminsClick}
                  onAddUserClick={() => setShowCreateUserOrAdminModal(true)}
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