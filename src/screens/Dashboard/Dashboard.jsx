import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FiUsers, FiFileText, FiUserCheck } from "react-icons/fi";
import { FaPoll } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import PostSection from "./postSection/PostSection";
import StatsCards from "../../components/common/StatsCards";
import BootstrapButton from "../../components/common/BootstrapButton";
import UserInteractionsChart from "./UserInteractionsChart";
import DeleteModal from "../../components/modals/DeleteModal";
import FlagModal from "../../components/modals/FlagModal";
import PostDetailModal from "../../components/modals/PostDetailModal";
import CreatePostModal from "../../components/modals/CreatePostModal";
import API from "../../api/endpoint";
import "../../assets/css/Dashboard.css";
import { formatDate } from '../../utils/DateUtility';
import { formatName } from '../../utils/Utility';


const Dashboard = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [formErrors, setFormErrors] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [editedPost, setEditedPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '', content: '', author: '', category: '', image: '', imageFile: null, imagePreview: ''
  });
  const [ordering, setOrdering] = useState("newest"); // Default to newest
  const [searchTerm, setSearchTerm] = useState(""); // Add search term state
  
  // User data state
  const [userData, setUserData] = useState({
    name: "",
    role: "",
    isGodAdmin: false
  });

  const [modalState, setModalState] = useState({
    flag: { show: false, reason: "Hate speech or discrimination", comment: "" },
    delete: { show: false, reason: "Hate speech or discrimination", comment: "" },
    postDetail: { show: false, isEditMode: false },
    newPost: { show: false }
  });

  // Get user data from localStorage on mount
  useEffect(() => {
    try {
      // Try to get user data from localStorage
      const storedUserData = localStorage.getItem('userData');
      
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        
        // Ensure name is properly capitalized
        if (parsedUserData.name) {
          parsedUserData.name = formatName(parsedUserData.name);
        }
        
        setUserData(parsedUserData);
        console.log('[DASHBOARD] Loaded user data from localStorage:', parsedUserData);
      } else {
        // If no stored user data, use default values
        console.log('[DASHBOARD] No stored user data found, using defaults');
      }
    } catch (error) {
      console.error('[DASHBOARD] Error loading user data:', error);
    }
  }, []);

  const updateModalState = useCallback((type, show, post = null) => {
    if (post) setSelectedPost(post);
    setModalState(prev => ({ ...prev, [type]: { ...prev[type], show } }));
  }, []);

  const getPostAgeColor = (dateString) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - postDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours >= 24) {
      return "text-danger"; // Red for posts 24+ hours old
    } else if (diffHours >= 10) {
      return "text-warning"; // Yellow for posts 10-24 hours old
    } else {
      return "text-success"; // Green for posts less than 10 hours old
    }
  };

  const formatPostAge = (dateString) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - postDate;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'}`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'min' : 'mins'}`;
    } else {
      return `${diffSeconds} ${diffSeconds === 1 ? 'sec' : 'secs'}`;
    }
  };

  // Function to fetch posts from API with search capability
  const fetchPosts = useCallback(async (search = "", showLoader = true) => {
    try {
      // Skip fetching for reposted filter as it's handled by the PostSection component
      if (activeFilter === "reposted") {
        console.log(`[DASHBOARD] Skipping regular fetch for 'reposted' filter`);
        if (showLoader) {
          setLoading(false);
        }
        return; // Exit early
      }

      if (showLoader) {
        setLoading(true);
      }
      // Map the filter to the correct status value
      const statusMap = {
        "all": "all",
        "approved": "approved",
        "review": "pending",
        "flagged": "red_flag",
        "deleted": "rejected",
        "reposted": "all" // For reposted, we'll fetch all and filter client-side
      };

      const status = statusMap[activeFilter] || "all";
      console.log(`[DASHBOARD] fetchPosts - activeFilter: "${activeFilter}", mapped to API status: "${status}"`);
      
      let url = `${API.BASE_URL}${API.ENDPOINTS.POSTS}?status=${status}&ordering=${ordering}`;
      
      // Add search parameter if provided
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      console.log(`[DASHBOARD] API Request: GET ${url}`);
      console.log(`[DASHBOARD] Active Filter: ${activeFilter}, Status: ${status}`);
      
      const res = await fetch(url, { headers: API.getHeaders() });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      console.log(`[DASHBOARD] API Response:`, {
        url: url,
        status: res.status,
        count: data.count,
        results: data.results,
        next: data.next,
        previous: data.previous,
        ordering: ordering,
        search: search
      });

      const approved = data.results.map(p => p.id);
      setApprovedPosts(approved);
      setTotalPosts(data.count);
      setTotalPages(Math.max(1, Math.ceil(data.count / 100)));

      const formattedPosts = data.results.map(p => ({
        id: p.id,
        title: p.description || "No title",
        content: p.description || "No content",
        author: p.created_by.full_name,
        image: p.media.length ? API.getImageUrl(p.media[0].media) : null,
        post_status: p.post_status,
        date: formatDate(p.date_created),
        date_created: p.date_created,
        age: formatPostAge(p.date_created),
        ageColor: getPostAgeColor(p.date_created),
        flagged: p.post_status === "red_flag" || p.flagged || false,
        isDeleted: p.post_status === "rejected" || p.isDeleted || false,
        flagReason: p.flagReason,
        flagComment: p.flagComment,
        authorImage: API.getImageUrl(p.created_by.picture),
        isApproved: p.post_status === "approved"
      }));

      // Special handling for flagged filter since API might not return correct data
      if (activeFilter === "flagged") {
        // Get the latest posts that are flagged from memory or API
        console.log(`[DASHBOARD] Special handling for flagged posts`);
        
        // If no flagged posts are found directly from API, we'll filter them from all posts
        if (formattedPosts.filter(p => p.flagged).length === 0) {
          console.log(`[DASHBOARD] No flagged posts from API, fetching all posts`);
          
          // Fetch all posts to find flagged ones
          const allPostsUrl = `${API.BASE_URL}${API.ENDPOINTS.POSTS}?status=all&ordering=${ordering}`;
          const allPostsRes = await fetch(allPostsUrl, { headers: API.getHeaders() });
          if (allPostsRes.ok) {
            const allPostsData = await allPostsRes.json();
            const allFormattedPosts = allPostsData.results.map(p => ({
              id: p.id,
              title: p.description || "No title",
              content: p.description || "No content",
              author: p.created_by.full_name,
              image: p.media.length ? API.getImageUrl(p.media[0].media) : null,
              post_status: p.post_status,
              date: formatDate(p.date_created),
              date_created: p.date_created,
              age: formatPostAge(p.date_created),
              ageColor: getPostAgeColor(p.date_created),
              flagged: p.post_status === "red_flag" || p.flagged || false,
              flagReason: p.flagReason,
              flagComment: p.flagComment,
              authorImage: API.getImageUrl(p.created_by.picture),
              isApproved: p.post_status === "approved"
            }));
            
            // Filter out flagged posts
            const flaggedPosts = allFormattedPosts.filter(p => p.flagged || p.post_status === "red_flag");
            console.log(`[DASHBOARD] Found ${flaggedPosts.length} flagged posts from all posts`);
            
            if (flaggedPosts.length > 0) {
              // Use the flagged posts found from all posts
              setPosts(flaggedPosts);
              setError(null);
              return; // Return early since we've handled the posts
            }
          }
        }
      }
      
      // Special handling for deleted filter to ensure deleted posts are properly displayed
      if (activeFilter === "deleted") {
        console.log(`[DASHBOARD] Special handling for deleted posts`);
        
        // If no deleted posts are found directly from API, fetch all posts
        if (formattedPosts.filter(p => p.isDeleted || p.post_status === "rejected").length === 0) {
          console.log(`[DASHBOARD] No deleted posts from API, fetching all posts`);
          
          // Fetch all posts to find deleted ones
          const allPostsUrl = `${API.BASE_URL}${API.ENDPOINTS.POSTS}?status=all&ordering=${ordering}`;
          const allPostsRes = await fetch(allPostsUrl, { headers: API.getHeaders() });
          
          if (allPostsRes.ok) {
            const allPostsData = await allPostsRes.json();
            const allFormattedPosts = allPostsData.results.map(p => ({
              id: p.id,
              title: p.description || "No title",
              content: p.description || "No content",
              author: p.created_by.full_name,
              image: p.media.length ? API.getImageUrl(p.media[0].media) : null,
              post_status: p.post_status,
              date: formatDate(p.date_created),
              date_created: p.date_created,
              age: formatPostAge(p.date_created),
              ageColor: getPostAgeColor(p.date_created),
              flagged: p.post_status === "red_flag" || p.flagged || false,
              isDeleted: p.post_status === "rejected" || p.isDeleted || false,
              deleteReason: p.deleteReason,
              deleteComment: p.deleteComment,
              authorImage: API.getImageUrl(p.created_by.picture),
              isApproved: p.post_status === "approved"
            }));
            
            // Filter out deleted posts
            const deletedPosts = allFormattedPosts.filter(p => p.isDeleted || p.post_status === "rejected");
            console.log(`[DASHBOARD] Found ${deletedPosts.length} deleted posts from all posts`);
            
            if (deletedPosts.length > 0) {
              // Use the deleted posts found from all posts
              setPosts(deletedPosts);
              setError(null);
              return; // Return early since we've handled the posts
            }
          }
        }
      }

      // Log information about flagged posts
      if (activeFilter === "flagged" || status === "red_flag") {
        const flaggedCount = formattedPosts.filter(p => p.flagged).length;
        console.log(`[DASHBOARD] Flagged posts found: ${flaggedCount}`);
        console.log(`[DASHBOARD] Flagged posts:`, formattedPosts.filter(p => p.flagged));
      }
      
      // Log information about deleted posts
      if (activeFilter === "deleted" || status === "rejected") {
        const deletedCount = formattedPosts.filter(p => p.isDeleted || p.post_status === "rejected").length;
        console.log(`[DASHBOARD] Deleted posts found: ${deletedCount}`);
        console.log(`[DASHBOARD] Deleted posts:`, formattedPosts.filter(p => p.isDeleted || p.post_status === "rejected"));
      }

      setPosts(formattedPosts);
      setError(null);
    } catch (err) {
      console.error(`[DASHBOARD] API Error:`, {
        error: err.message,
        stack: err.stack
      });
      setError("Failed to load posts. Please try again later.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [activeFilter, ordering]);

  // Search posts function to be passed to PostSection - don't show loader during search
  const searchPosts = (term, filter) => {
    setSearchTerm(term);
    // Use false for showLoader parameter to prevent full refresh
    fetchPosts(term, false);
  };

  const onFilterChange = (filter) => {
    console.log(`[DASHBOARD] Filter changing from ${activeFilter} to ${filter}`);
    setActiveFilter(filter);
  };

  useEffect(() => {
    console.log(`[DASHBOARD] useEffect triggered - activeFilter: ${activeFilter}`);
    
    // Skip fetching posts when filter is "reposted" since that's handled in PostSection component
    if (activeFilter === "reposted") {
      console.log("[DASHBOARD] Skipping fetchPosts for 'reposted' filter as it's handled by PostSection");
      // Set loading to false in case it was set to true
      setLoading(false);
      return;
    }
    
    fetchPosts(searchTerm);
  }, [fetchPosts, currentPage, activeFilter, ordering, searchTerm]);

  const statsCardsData = [
    { title: "Total Users", value: "1,234", icon: <FiUsers />, color: "primary" },
    { title: "Total Posts", value: "456", icon: <FiFileText />, color: "success" },
    { title: "Active Users", value: "60%", icon: <FiUserCheck />, color: "warning" },
    { title: "Polling Turn Up", value: "75%", icon: <FaPoll />, color: "info" }
  ];

  const chartData = [
    { name: "Jan", uv: 1500 }, { name: "Feb", uv: 1800 }, { name: "Mar", uv: 2200 },
    { name: "Apr", uv: 2800 }, { name: "May", uv: 3500 }, { name: "Jun", uv: 4500 },
    { name: "Jul", uv: 5000 }, { name: "Aug", uv: 3500 }, { name: "Sep", uv: 2500 },
    { name: "Oct", uv: 1800 }, { name: "Nov", uv: 1500 }, { name: "Dec", uv: 1500 }
  ];

  // Helper function to format role name for display
  const formatRoleName = (role) => {
    if (!role) return "User";
    
    // Convert snake_case to Title Case
    const formatted = role.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
      
    return formatted;
  };

  return (
    <Container fluid className="p-4" style={{ background: "#f8fcf8" }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-md-row flex-column">
        <h4 className="fw-bold m-0">Suniye Netaji Admin Dashboard</h4>
        <BootstrapButton
          variant="dark"
          className="mt-md-0 mt-3 access-control-btn"
          onClick={() => navigate("/access-control")}
          style={{ padding: "0.4rem 1.2rem" }}
        >
          Access Control Center
        </BootstrapButton>
      </div>

      <p className="mb-4" style={{ fontSize: "12px" }}>
        Welcome, <strong>{formatName(userData.name) || "User"}</strong> ({formatRoleName(userData.role) || "User"})
      </p>

      <StatsCards customStats={statsCardsData} />

      <Row className="g-3 mb-4">
        <Col xs={12}>
          <UserInteractionsChart customData={chartData} title="User Interactions" height={300} />
        </Col>
      </Row>

      {loading ? (
        <div className="text-center p-5">Loading...</div>
      ) : (
        <>
          {console.log(`[DASHBOARD] Rendering PostSection with ${posts.length} posts`)}
          <PostSection
            posts={posts}
            setPosts={setPosts}
            currentPage={currentPage}
            totalPages={totalPages}
            totalPosts={totalPosts}
            approvedPosts={approvedPosts}
            setApprovedPosts={setApprovedPosts}
            onPageChange={setCurrentPage}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            ordering={ordering}
            onOrderingChange={setOrdering}
            error={error}
            searchPosts={searchPosts}
          />
        </>
      )}

      {/* Modals */}
      <FlagModal
        show={modalState.flag.show}
        onHide={() => updateModalState("flag", false)}
        selectedPost={selectedPost}
        flagReason={modalState.flag.reason}
        setFlagReason={reason => setModalState(p => ({ ...p, flag: { ...p.flag, reason } }))}
        flagComment={modalState.flag.comment}
        setFlagComment={comment => setModalState(p => ({ ...p, flag: { ...p.flag, comment } }))}
        confirmFlag={() => {
          setPosts(prev => prev.map(p => p.id === selectedPost?.id ? { ...p, flagged: true } : p));
          updateModalState("flag", false);
        }}
        canConfirmAction={(reason, comment) => reason && (reason !== "Other" || comment.trim())}
      />

      <DeleteModal
        show={modalState.delete.show}
        onHide={() => updateModalState("delete", false)}
        selectedPost={selectedPost}
        deleteReason={modalState.delete.reason}
        setDeleteReason={reason => setModalState(p => ({ ...p, delete: { ...p.delete, reason } }))}
        deleteComment={modalState.delete.comment}
        setDeleteComment={comment => setModalState(p => ({ ...p, delete: { ...p.delete, comment } }))}
        confirmDelete={() => {
          setPosts(prev => prev.filter(p => p.id !== selectedPost?.id));
          updateModalState("delete", false);
        }}
        canConfirmAction={(reason, comment) => reason && (reason !== "Other" || comment.trim())}
      />

      <PostDetailModal
        show={modalState.postDetail.show}
        onHide={() => updateModalState("postDetail", false)}
        isEditMode={modalState.postDetail.isEditMode}
        setIsEditMode={val => setModalState(p => ({ ...p, postDetail: { ...p.postDetail, isEditMode: val } }))}
        selectedPost={selectedPost}
        editedPost={editedPost}
        setEditedPost={setEditedPost}
        handlePostUpdate={updatedPost => {
          setPosts(prev => prev.map(p => (p.id === updatedPost.id ? updatedPost : p)));
          updateModalState("postDetail", false);
        }}
      />

      <CreatePostModal
        show={modalState.newPost.show}
        onHide={() => updateModalState("newPost", false)}
        newPost={newPost}
        setNewPost={setNewPost}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        handlePostCreate={post => {
          setPosts(prev => [post, ...prev]);
          updateModalState("newPost", false);
        }}
      />
    </Container>
  );
};

export default Dashboard;
