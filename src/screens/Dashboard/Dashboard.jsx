import React, { useState, useEffect } from "react";
import PostReview from "./PostReview";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
} from "react-bootstrap";
import {
  FiUsers,
  FiShoppingCart,
  FiDollarSign,
  FiTrendingUp,
  FiMoreVertical,
  FiTrash,
  FiFlag,
  FiFileText,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiEdit,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../../assets/css/Dashboard.css";
import { Link } from "react-router-dom";
import { FaPoll } from "react-icons/fa";

// Comment out the initialPosts
// const initialPosts = [
//   {
//     id: 1,
//     title: "New Policies Announcement",
//     content: "The government has introduced new policies for economic growth.",
//     author: "Sparta",
//     date: "2025-04-01",
//     flagged: false
//   },
//   {
//     id: 2,
//     title: "Healthcare Improvements",
//     content: "New hospitals are being built to improve healthcare facilities.",
//     author: "Tom",
//     date: "2025-04-02",
//     flagged: false
//   },
//   {
//     id: 3,
//     title: "Agricultural Support Scheme",
//     content: "Government launches support scheme for farmers.",
//     author: "Jhon",
//     date: "2025-04-03",
//     flagged: false
//   },
// ];

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedPost, setEditedPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    author: '',
    category: '',
    image: '',
    imageFile: null,
    imagePreview: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    // Fetch posts from API
    const fetchPosts = async () => {
      try {
        setLoading(true);

        // Use hardcoded token directly
        const headers = {
          'Authorization': 'Token 7b257e1452f1115b0c70f80a1d54ccd8615aa52c'
        };

        // Determine which API endpoint to use based on activeFilter
        let apiUrl;
        let allPosts = [];
        let totalCount = 0;

        if (activeFilter === "all") {
          // Fetch both pending and approved posts
          const [pendingResponse, approvedResponse] = await Promise.all([
            fetch(`https://stage.suniyenetajee.com/api/v1/web/posts/?status=pending&page=${currentPage}&ordering=date_created&page_size=10`, { headers }),
            fetch(`https://stage.suniyenetajee.com/api/v1/web/posts/?status=approved&page=${currentPage}&ordering=date_created&page_size=10`, { headers })
          ]);

          if (!pendingResponse.ok || !approvedResponse.ok) {
            throw new Error(`HTTP error! Status: ${pendingResponse.status} or ${approvedResponse.status}`);
          }

          const pendingData = await pendingResponse.json();
          const approvedData = await approvedResponse.json();

          console.log('Pending Posts API Response:', {
            count: pendingData.count,
            results: pendingData.results,
            next: pendingData.next,
            previous: pendingData.previous
          });

          console.log('Approved Posts API Response:', {
            count: approvedData.count,
            results: approvedData.results,
            next: approvedData.next,
            previous: approvedData.previous
          });

          // Combine the results
          allPosts = [...pendingData.results, ...approvedData.results];
          totalCount = pendingData.count + approvedData.count;

          // Set approved post IDs
          const approvedPostIds = approvedData.results.map(post => post.id);
          setApprovedPosts(approvedPostIds);
          console.log('Approved Post IDs:', approvedPostIds);
        } else {
          // Use the specific filter
          const status = activeFilter === "approved" ? "approved" : "pending";
          apiUrl = `https://stage.suniyenetajee.com/api/v1/web/posts/?status=${status}&page=${currentPage}&ordering=date_created&page_size=10`;

          console.log('Fetching posts from:', apiUrl);

          const response = await fetch(apiUrl, { headers });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();

          console.log('Posts API Response:', {
            count: data.count,
            results: data.results,
            next: data.next,
            previous: data.previous
          });

          allPosts = data.results;
          totalCount = data.count;

          if (status === "approved") {
            const approvedPostIds = data.results.map(post => post.id);
            setApprovedPosts(approvedPostIds);
            console.log('Approved Post IDs:', approvedPostIds);
          }
        }

        setTotalPosts(totalCount);
        setTotalPages(Math.ceil(totalCount / 10));

        const formattedPosts = allPosts.map(post => ({
          id: post.id,
          title: post.description || "No title",
          content: post.description || "No content",
          author: post.created_by.full_name,
          date: new Date(post.date_created).toISOString().split('T')[0],
          date_created: post.date_created,
          flagged: post.flagged || false,
          image: post.media.length > 0 ? `https://stage.suniyenetajee.com${post.media[0].media}` : null,
          authorImage: post.created_by.picture ? `https://stage.suniyenetajee.com${post.created_by.picture}` : null,
          isApproved: post.status === "approved"
        }));

        console.log('Formatted Posts:', formattedPosts);
        setPosts(formattedPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    console.log(`Fetching data for page ${currentPage} with filter ${activeFilter}`);
    fetchPosts();
  }, [currentPage, activeFilter]);

  // Handle edit changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save edited post
  const saveEditedPost = () => {
    // Update the posts array with the edited post
    const updatedPosts = posts.map(post =>
      post.id === editedPost.id ? editedPost : post
    );

    setPosts(updatedPosts);
    setSelectedPost(editedPost);
    setIsEditMode(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditedPost(selectedPost);
    setIsEditMode(false);
  };

  // Enable edit mode
  const enableEditMode = () => {
    setEditedPost({ ...selectedPost });
    setIsEditMode(true);
  };

  // Helper function to check if a post is an admin post
  const isAdminPost = (post) => {
    // For now, no posts are considered admin posts until we have an admin flag
    return false; // Will be updated when admin flag is available in API
  };

  const handleNewPostChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a URL for the file for preview
      const imagePreview = URL.createObjectURL(file);
      setNewPost(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: imagePreview
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!newPost.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!newPost.category) {
      errors.category = 'Please select a category';
    }

    if (!newPost.content.trim()) {
      errors.content = 'Content is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreatePost = () => {
    // Validate form before submission
    if (!validateForm()) {
      // Reset the button appearance if validation fails
      const button = document.querySelector('.modal-footer button:last-child');
      if (button) {
        button.style.backgroundColor = 'white';
        button.style.color = 'black';
      }
      return;
    }

    // Create a new post with the form data
    const post = {
      id: posts.length + 1,
      title: newPost.title,
      content: newPost.content,
      author: newPost.author || 'Admin', // Default author if not provided
      date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      flagged: false,
      category: newPost.category,
      image: newPost.imagePreview || newPost.image // Use either uploaded or URL image
    };

    // Add the new post to the posts array
    setPosts([...posts, post]);

    // Reset form and close modal
    setNewPost({
      title: '',
      content: '',
      author: '',
      category: '',
      image: '',
      imageFile: null,
      imagePreview: ''
    });
    setFormErrors({});
    setShowNewPostModal(false);
  };

  // Handle page change
  const handlePageChange = (page) => {
    console.log(`Changing to page ${page}`);
    setCurrentPage(page);
    // Scroll to top of the table when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add this function to handle filter changes
  const handleFilterChange = (filter) => {
    console.log("Dashboard: Changing filter to:", filter);
    setActiveFilter(filter);
  };

  const statsCards = [
    {
      title: "Total Users",
      value: "1,234",
      icon: <FiUsers className="stat-icon" />,
      color: "primary",
      increase: true,
      percent: "12%",
    },
    {
      title: "Total Posts",
      value: "456",
      icon: <FiFileText className="stat-icon" />,
      color: "success",
      increase: true,
      percent: "8%",
    },
    {
      title: "Active Users",
      value: "60%",
      icon: <FiUserCheck className="stat-icon" />,
      color: "warning",
      increase: false,
      percent: "5%",
    },
    {
      title: "Polling Turn Up",
      value: "75%",
      icon: <FaPoll className="stat-icon" />,
      color: "info",
      increase: true,
      percent: "15%",
    },
  ];

  const chartData = [
    { name: "Jan", uv: 1500 },
    { name: "Feb", uv: 1800 },
    { name: "Mar", uv: 2200 },
    { name: "Apr", uv: 2800 },
    { name: "May", uv: 3500 },
    { name: "Jun", uv: 4500 },
    { name: "Jul", uv: 5000 },
    { name: "Aug", uv: 3500 },
    { name: "Sep", uv: 2500 },
    { name: "Oct", uv: 1800 },
    { name: "Nov", uv: 1500 },
    { name: "Dec", uv: 1500 },
  ];

  const dashboardStyle = {
    background: "linear-gradient(to bottom, #f8fcf8 0%, #f8fcf8 100%)",
    minHeight: "100vh",
    paddingBottom: "2rem",
  };

  // Add a handler for post updates
  const handlePostsUpdate = (updatedPosts) => {
    console.log("Dashboard: Updating posts:", updatedPosts);
    setPosts(updatedPosts);
  };

  return (
    <Container fluid className="p-4" style={dashboardStyle}>
      <h4 className="mb-4 fw-bold">Suniye Netaji Admin Dashboard</h4>
      <p style={{ fontSize: "12px", marginTop: "-15px", marginBottom: "20px" }}>
        Welcome, <span style={{ fontWeight: "bold" }}>Shri Venkateshwara</span>{" "}
        (Reporter) - Delhi
      </p>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        {statsCards.map((stat, index) => (
          <Col key={index} xs={12} sm={6} md={3}>
            <Card
              className={`border-0 shadow-sm bg-white quick-action-card`}
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = "white"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div
                      className="small mb-1 fw-bold"
                      style={{ color: "grey" }}
                    >
                      {stat.title}
                    </div>
                    <h3
                      className="fw-bold"
                      style={{
                        color:
                          stat.value === "1,234"
                            ? "black"
                            : stat.value === "60%"
                              ? "#198754" /* Bootstrap success/green color */
                              : stat.value === "40%"
                                ? "#dc3545" /* Bootstrap danger/red color */
                                : stat.value === "24%"
                                  ? "#dc3545" /* Bootstrap danger/red color */
                                  : "inherit",
                      }}
                    >
                      {stat.value}
                    </h3>
                  </div>
                  {stat.icon}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Section */}
      <Row className="g-3 mb-4" style={{ justifyContent: "space-between" }}>
        <Col xs={12} lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-bold">User Interactions</h5>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#FFFFFF"
                        stopOpacity={0.3}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="uv"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorUv)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Post Review Section */}
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading posts...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <PostReview
          posts={posts}
          setPosts={handlePostsUpdate}
          currentPage={currentPage}
          totalPages={totalPages}
          totalPosts={totalPosts}
          approvedPosts={approvedPosts}
          setApprovedPosts={setApprovedPosts}
          onPageChange={handlePageChange}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Flag Warning Modal */}
      <Modal
        show={showFlagModal}
        onHide={() => setShowFlagModal(false)}
        centered
        className="custom-modal"
      >
        <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '1rem' }}>
          <Modal.Title>⚠️ Warning: Inappropriate Content</Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowFlagModal(false)}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '1rem',
              width: '24px',
              height: '24px',
              backgroundColor: '#000',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              opacity: 1.0
            }}
          >
            <span style={{ color: 'white', fontSize: '1.2rem', marginTop: '-2px', marginLeft: '-1px' }}>×</span>
          </button>
        </Modal.Header>
        <Modal.Body>
          <p>
            The post you are flagging contains content that violates our
            community guidelines.
          </p>
          <p>
            If the user continues to post inappropriate content, their account
            may be suspended or permanently banned.
          </p>
          <p>Please select a reason for flagging this content:</p>
          <select className="form-select mb-3">
            <option>Hate speech or discrimination</option>
            <option>Violence or threatening content</option>
            <option>Harassment or bullying</option>
            <option>Misinformation</option>
            <option>Other (please specify)</option>
          </select>
          <p>Do you want to proceed with flagging this post?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowFlagModal(false)}
            style={{ backgroundColor: '#000', borderColor: '#000' }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              // Handle flag confirmation logic here
              const updatedPosts = posts.map((p) =>
                p.id === selectedPost.id ? { ...p, flagged: true } : p
              );
              setPosts(updatedPosts);
              setShowFlagModal(false);
            }}
          >
            Confirm Flag
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className="custom-modal"
      >
        <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '1rem' }}>
          <Modal.Title>⚠️ Confirm Deletion</Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowDeleteModal(false)}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '1rem',
              width: '24px',
              height: '24px',
              backgroundColor: '#000',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              opacity: 1.0
            }}
          >
            <span style={{ color: 'white', fontSize: '1.2rem', marginTop: '-2px', marginLeft: '-1px' }}>×</span>
          </button>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this post?</p>
          {selectedPost && (
            <div className="p-3 bg-light rounded mb-3">
              <h6 className="fw-bold">{selectedPost.title}</h6>
              <p className="text-muted mb-0 small">{selectedPost.content}</p>
            </div>
          )}
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            style={{ backgroundColor: '#000', borderColor: '#000' }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              // Handle delete confirmation logic here
              setPosts(posts.filter((post) => post.id !== selectedPost?.id));
              setShowDeleteModal(false);
            }}
          >
            Delete Permanently
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Post Detail Modal */}
      <Modal
        show={showPostDetailModal}
        onHide={() => {
          setShowPostDetailModal(false);
          setIsEditMode(false);
        }}
        centered
        size="lg"
        className="custom-modal"
      >
        <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '1rem' }}>
          <Modal.Title>{isEditMode ? "Edit Post" : "Post Details"}</Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setShowPostDetailModal(false);
              setIsEditMode(false);
            }}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '1rem',
              width: '24px',
              height: '24px',
              backgroundColor: '#000',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              opacity: 1.0
            }}
          >
            <span style={{ color: 'white', fontSize: '1.2rem', marginTop: '-2px', marginLeft: '-1px' }}>×</span>
          </button>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {selectedPost && (
            <Card className="border-0 shadow-sm">
              {selectedPost.image ? (
                <div className="d-flex justify-content-center">
                  <div style={{ width: "100%", maxWidth: "18rem" }}>
                    <Card.Img
                      variant="top"
                      src={selectedPost.image}
                      style={{
                        height: "auto",
                        aspectRatio: "16/9",
                        objectFit: "cover",
                      }}
                      className="img-fluid"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="d-flex justify-content-center">
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "18rem",
                      height: "200px",
                      background: "#f8f9fa",
                      border: "1px dashed #dee2e6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px"
                    }}
                  >
                    <span className="text-muted">No Media</span>
                  </div>
                </div>
              )}
              <Card.Body>
                {isEditMode ? (
                  // Edit Mode - Show form fields
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={editedPost.title}
                        onChange={handleEditChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={editedPost.category || ''}
                        onChange={handleEditChange}
                      >
                        <option value="">Select Category</option>
                        <option value="Politics">Politics</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Education">Education</option>
                        <option value="Technology">Technology</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Content</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="content"
                        value={editedPost.content}
                        onChange={handleEditChange}
                      />
                    </Form.Group>
                  </Form>
                ) : (
                  // View Mode - Show content
                  <>
                    <Card.Title className="fw-bold mb-3">
                      {selectedPost.title}
                    </Card.Title>
                    <div className="mb-3">
                      {selectedPost.title.toLowerCase().includes("policies") && (
                        <span className="badge bg-secondary me-2">Politics</span>
                      )}
                      {selectedPost.title.toLowerCase().includes("healthcare") && (
                        <span className="badge bg-info me-2">Healthcare</span>
                      )}
                      {selectedPost.title
                        .toLowerCase()
                        .includes("agricultural") && (
                          <span className="badge bg-success me-2">Agriculture</span>
                        )}
                      <span className="badge bg-primary">Featured</span>
                    </div>
                    <Card.Text className="mb-4">{selectedPost.content}</Card.Text>

                    {/* Additional content */}
                    <h6 className="fw-bold mt-4">Background Information</h6>
                    <Card.Text className="mb-4">
                      This policy announcement comes after months of deliberation
                      and public consultation. The government has been working on
                      these reforms since early 2025, with input from various
                      stakeholders including industry leaders, civil society
                      organizations, and academic experts.
                    </Card.Text>

                    <h6 className="fw-bold mt-4">Impact Analysis</h6>
                    <Card.Text className="mb-4">
                      Economic experts predict these policies will boost GDP growth
                      by 2-3% over the next fiscal year. Small businesses are
                      expected to benefit significantly from tax incentives and
                      reduced regulatory burdens. However, some sectors may face
                      adjustment challenges in the short term.
                    </Card.Text>

                    <h6 className="fw-bold mt-4">Public Reaction</h6>
                    <Card.Text className="mb-4">
                      Initial public response has been mixed. A recent poll shows
                      58% support for the new policies, with stronger approval among
                      urban residents and younger demographics. Opposition parties
                      have criticized aspects of the implementation timeline.
                    </Card.Text>
                  </>
                )}

                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <small className="text-muted d-block">
                      Posted By {selectedPost.author}
                    </small>
                    <small className="text-muted d-block">
                      Published on {selectedPost.date}
                    </small>
                    <small className="text-muted d-block">
                      Last updated: April 5, 2025
                    </small>
                    {isAdminPost(selectedPost) && (
                      <small className="text-success d-block fw-bold">
                        Admin Post
                      </small>
                    )}
                  </div>
                  {!isEditMode && (
                    <div>
                      {isAdminPost(selectedPost) && (
                        <Button
                          variant="light"
                          size="sm"
                          className="me-2"
                          onClick={enableEditMode}
                          title="Edit Post"
                        >
                          <FiEdit style={{ color: "#000" }} />
                        </Button>
                      )}
                      <Button variant="light" size="sm" className="me-2">
                        <FiClock style={{ color: "#f0ad4e" }} />
                      </Button>
                      <Button
                        variant={selectedPost.flagged ? "success" : "light"}
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          if (selectedPost.flagged) {
                            // If already flagged, unflag directly without showing modal
                            const updatedPosts = posts.map((p) =>
                              p.id === selectedPost.id
                                ? { ...p, flagged: false }
                                : p
                            );
                            setPosts(updatedPosts);
                          } else {
                            // If not flagged, show the flag modal
                            setShowPostDetailModal(false);
                            setShowFlagModal(true);
                          }
                        }}
                      >
                        <FiFlag
                          style={{
                            color: selectedPost.flagged ? "white" : "black",
                          }}
                        />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setShowPostDetailModal(false);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FiTrash />
                      </Button>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          {isEditMode ? (
            <>
              <Button
                variant="secondary"
                onClick={cancelEditing}
                style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={saveEditedPost}
                style={{ backgroundColor: '#000', borderColor: '#000' }}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setShowPostDetailModal(false)}
              style={{ backgroundColor: '#000', borderColor: '#000' }}
            >
              Close
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* New Post Modal */}
      <Modal
        show={showNewPostModal}
        onHide={() => setShowNewPostModal(false)}
        centered
        size="lg"
        className="custom-modal"
      >
        <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '1rem' }}>
          <Modal.Title>Create New Post</Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowNewPostModal(false)}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '1rem',
              width: '24px',
              height: '24px',
              backgroundColor: '#000',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              opacity: 1.0
            }}
          >
            <span style={{ color: 'white', fontSize: '1.2rem', marginTop: '-2px', marginLeft: '-1px' }}>×</span>
          </button>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                id="title"
                name="title"
                value={newPost.title}
                onChange={handleNewPostChange}
                required
              />
              {formErrors.title && <div className="invalid-feedback">{formErrors.title}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="category" className="form-label">Category <span className="text-danger">*</span></label>
              <select
                className={`form-select ${formErrors.category ? 'is-invalid' : ''}`}
                id="category"
                name="category"
                value={newPost.category}
                onChange={handleNewPostChange}
                required
              >
                <option value="">Select a category</option>
                <option value="Politics">Politics</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Education">Education</option>
                <option value="Technology">Technology</option>
              </select>
              {formErrors.category && <div className="invalid-feedback">{formErrors.category}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="content" className="form-label">Content <span className="text-danger">*</span></label>
              <textarea
                className={`form-control ${formErrors.content ? 'is-invalid' : ''}`}
                id="content"
                name="content"
                rows="6"
                value={newPost.content}
                onChange={handleNewPostChange}
                required
              ></textarea>
              {formErrors.content && <div className="invalid-feedback">{formErrors.content}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="author" className="form-label">Author</label>
              <input
                type="text"
                className="form-control"
                id="author"
                name="author"
                value={newPost.author}
                onChange={handleNewPostChange}
                placeholder="Your name (defaults to Admin if left blank)"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Featured Image</label>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="imageFile" className="form-label">Upload from device</label>
                    <input
                      type="file"
                      className="form-control"
                      id="imageFile"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div className="form-text">Select image from your device</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="image" className="form-label">Or use image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      id="image"
                      name="image"
                      value={newPost.image}
                      onChange={handleNewPostChange}
                      placeholder="https://example.com/image.jpg"
                    />
                    <div className="form-text">Enter a direct link to an image</div>
                  </div>
                </div>
              </div>
              {(newPost.imagePreview || newPost.image) && (
                <div className="mt-2 text-center border p-2">
                  <p className="mb-2 fw-bold">Image Preview</p>
                  <img
                    src={newPost.imagePreview || newPost.image}
                    alt="Preview"
                    className="img-fluid"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    onLoad={(e) => { e.target.style.display = 'block'; }}
                  />
                </div>
              )}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowNewPostModal(false)}
            style={{ backgroundColor: '#000', borderColor: '#000' }}
          >
            Cancel
          </Button>
          <Button
            id="createPostButton"
            style={{
              backgroundColor: 'white',
              color: 'black',
              borderColor: '#000',
              borderWidth: '1px',
              transition: 'all 0.2s ease'
            }}
            onClick={(e) => {
              const button = e.currentTarget;
              // Change to black background with white text for visual feedback
              button.style.backgroundColor = '#000';
              button.style.color = 'white';

              // Process the form after a small delay for visual feedback
              setTimeout(() => {
                handleCreatePost();
              }, 150);
            }}
            onMouseOver={(e) => {
              // Only change background on hover if not already clicked
              if (e.currentTarget.style.color !== 'white') {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }
            }}
            onMouseOut={(e) => {
              // Only reset on mouse out if not already clicked
              if (e.currentTarget.style.color !== 'white') {
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
          >
            Create Post
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;
