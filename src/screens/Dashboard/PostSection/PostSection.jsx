import React, { useState, useEffect } from "react";
import "../../../assets/css/Dashboard.css";
import { Container, Row, Col, InputGroup, Form } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DeleteModal from '../../../components/modals/DeleteModal';
import FlagModal from '../../../components/modals/FlagModal';
import PostDetailModal from '../../../components/modals/PostDetailModal';
import CreatePostModal from '../../../components/modals/CreatePostModal';
import RestorePostModal from '../../../components/modals/RestorePostModal';
import ManagePost from './ManagePost';
import FilterAndModeration from './FilterAndModeration';
import QuickAdminActions from './QuickAdminActions';
import { formatDate } from '../../../utils/Utility';
import API from '../../../api/endpoint';
import { showSuccessToast, showErrorToast } from "../../../components/common/Toast.jsx";

const PostSection = ({
  inDashboard = false,
  posts = [],
  setPosts,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalPosts = 0,
  approvedPosts = [],
  setApprovedPosts,
  activeFilter = "pending",
  onFilterChange,
  ordering = "newest",
  onOrderingChange,
  error = null,
  searchPosts
}) => {
  const navigate = useNavigate();

  // Modal states
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Post data states
  const [selectedPost, setSelectedPost] = useState(null);
  const [editedPost, setEditedPost] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [approvingPostId, setApprovingPostId] = useState(null);
  const [flaggingPostId, setFlaggingPostId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Form states
  const [flagComment, setFlagComment] = useState('');
  const [deleteComment, setDeleteComment] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [flagReasonId, setFlagReasonId] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteReasonId, setDeleteReasonId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newPost, setNewPost] = useState({
    content: ''
  });

  // Repost states
  const [repostingPostId, setRepostingPostId] = useState(null);

  // Keep track of whether this is the first render
  useEffect(() => {
    // Set search term from stored value if available
    if (window.currentSearchTerm) {
      setSearchTerm(window.currentSearchTerm);
    }
  }, []);

  // Post action handlers
  const handleApprovePost = async (postId) => {
    try {
      setApprovingPostId(postId);
      
      // Call the API to update post status
      const defaultReasonId = 1; // Using a default reason ID for approval
      await API.updatePostStatus(postId, "approve", defaultReasonId);
      
      // Update the local state
      setPosts(posts.map(post => post.id === postId ?
        { ...post, post_status: "approved" } : post));
      
      // If we have a setApprovedPosts function, update the approved posts list
      if (setApprovedPosts) {
        setApprovedPosts(prev => [...prev, postId]);
      }
      
      // Show success toast
      showSuccessToast("Post approved successfully!");
    } catch (error) {
      console.error("Error approving post:", error);
      showErrorToast("Failed to approve post. Please try again.");
    } finally {
      // Clear the approving state after a short delay for UI feedback
      setTimeout(() => {
        setApprovingPostId(null);
      }, 500);
    }
  };

  // Repost a post - Creates a copy of an approved post
  const handleRepost = async (postId) => {
    try {
      setRepostingPostId(postId);
      
      console.log(`[REPOST] Attempting to repost post ID: ${postId}`);
      
      // Call the API to repost the post
      const response = await API.repostPost(postId);
      
      console.log("[REPOST] Success response:", response);
      
      // Mark the original post as reposted in the UI
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, isReposted: true };
        }
        return post;
      }));
      
      // Show success toast
      showSuccessToast("Post reposted successfully!");
      
      // Show success message or notification
      console.log("Post successfully reposted:", response.message);
      
    } catch (error) {
      console.error("[REPOST] Error reposting post:", error);
      showErrorToast("Failed to repost. Please try again.");
    } finally {
      // Clear the reposting state after a short delay for UI feedback
      setTimeout(() => {
        setRepostingPostId(null);
      }, 500);
    }
  };

  const handleFlagButtonClick = (post) => {
    if (post.flagged) {
      // If post is already flagged, we need to call the API to unflag it
      // This assumes there's a way to unflag through API - if not, we need to handle accordingly
      try {
        console.log(`[UNFLAG] Attempting to unflag post ID: ${post.id}`);
        
        // Call API to unflag post - using an 'approve' action since there's no explicit unflag action
        API.updatePostStatus(
          post.id,
          "approve", // This would reset the flag
          1, // Default reason ID for approval
          "" // No remarks for unflagging
        )
        .then(response => {
          console.log(`[UNFLAG] Success! API response:`, response);
          
          // Update local state
          setPosts(posts.map(p => p.id === post.id ? 
            { 
              ...p, 
              flagged: false,
              post_status: p.post_status === "flagged" ? "pending" : p.post_status // Reset post_status if it was flagged
            } : p));
        })
        .catch(error => {
          console.error("[UNFLAG] Error unflagging post:", error);
        });
      } catch (error) {
        console.error("[UNFLAG] Error in unflag operation:", error);
      }
    } else {
      setSelectedPost(post);
      setShowFlagModal(true);
    }
  };

  const confirmFlag = async () => {
    if (!selectedPost) return;
    
    try {
      // Set flagging state for UI feedback
      setFlaggingPostId(selectedPost.id);
      
      console.log(`[FLAG] Attempting to flag post ID: ${selectedPost.id} with reason ID: ${flagReasonId}`);
      
      // Call the API to flag the post
      const response = await API.updatePostStatus(
        selectedPost.id, 
        "red_flag", 
        flagReasonId, 
        flagComment
      );
      
      console.log(`[FLAG] Success! API response:`, response);
      
      // Update the local state
      setPosts(posts.map(p => p.id === selectedPost.id ?
        { 
          ...p, 
          flagged: true, 
          post_status: "flagged",
          flagComment, 
          flagReason, 
          flagReasonId,
          flagReasonData: {
            id: flagReasonId,
            name: flagReason,
            comment: flagComment
          }
        } : p));
      
    } catch (error) {
      console.error("[FLAG] Error flagging post:", error);
      // Optionally show an error notification here
    } finally {
      // Reset the UI state
      setFlaggingPostId(null);
      setShowFlagModal(false);
      setSelectedPost(null);
      setFlagComment('');
      setFlagReason('');
      setFlagReasonId(null);
    }
  };

  // Edit functions
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedPost(prev => ({ ...prev, [name]: value }));
  };

  const saveEditedPost = () => {
    setPosts(posts.map(post => post.id === editedPost.id ? editedPost : post));
    setSelectedPost(editedPost);
    setIsEditMode(false);
  };

  const enableEditMode = () => {
    setEditedPost({ ...selectedPost });
    setIsEditMode(true);
  };

  const cancelEditing = () => {
    setEditedPost(selectedPost);
    setIsEditMode(false);
  };

  const handleNewPostChange = (e) => {
    const { name, value } = e.target;
    setNewPost({ ...newPost, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newPost.content.trim()) errors.content = "Content is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Filter functions
  const handleFilterButtonClick = (filter) => {
    if (filter === "flagged") {
      // Log information about flagged posts when this filter is selected
      const flaggedPosts = posts.filter(post => post.flagged || post.post_status === "flagged");
      console.log(`[POST SECTION] Showing flagged posts: ${flaggedPosts.length} found`);
      console.log('[POST SECTION] Flagged posts details:', flaggedPosts);
      
      // Check what properties are available on these posts to help with debugging
      if (flaggedPosts.length > 0) {
        console.log('[POST SECTION] First flagged post example:', {
          id: flaggedPosts[0].id,
          flagged: flaggedPosts[0].flagged,
          post_status: flaggedPosts[0].post_status,
          title: flaggedPosts[0].title
        });
      }
    }
    
    if (filter === "deleted") {
      // Log information about deleted posts when this filter is selected
      const deletedPosts = posts.filter(post => post.isDeleted || post.post_status === "rejected");
      console.log(`[POST SECTION] Showing deleted posts: ${deletedPosts.length} found`);
      console.log('[POST SECTION] Deleted posts details:', deletedPosts);
      
      // Check what properties are available on these posts to help with debugging
      if (deletedPosts.length > 0) {
        console.log('[POST SECTION] First deleted post example:', {
          id: deletedPosts[0].id,
          isDeleted: deletedPosts[0].isDeleted,
          post_status: deletedPosts[0].post_status,
          title: deletedPosts[0].title
        });
      }
    }
    
    if (filter === "reposted") {
      console.log(`[POST SECTION] Reposted posts button clicked, fetching from API`);
      
      // Fetch reposted posts from the API directly without changing filter
      fetchRepostedPosts();
      return; // Stop here to prevent triggering onFilterChange
    }
    
    console.log(`[POST SECTION] Filter button clicked: ${filter}, calling onFilterChange`);
    if (onFilterChange && typeof onFilterChange === 'function') {
      onFilterChange(filter);
    }
  };
  
  // Function to fetch reposted posts
  const fetchRepostedPosts = async () => {
    try {
      console.log('[POST SECTION] Fetching reposted posts from API');
      
      // Call the API to get reposted posts using our dedicated function
      const response = await API.getRepostedPosts();
      
      console.log('[POST SECTION] Reposted posts API response:', response);
      
      if (response && response.results && response.results.length > 0) {
        console.log('[POST SECTION] Sample raw API post:', response.results[0]);
        
        // Format posts for our application
        const formattedPosts = response.results.map(post => {
          const formattedPost = {
            id: post.id.toString(),
            title: post.description || "No title",
            content: post.description || "No content",
            author: post.created_by?.full_name || "Unknown",
            date: formatDate(new Date(post.date_created), 'api'),
            date_created: post.date_created,
            post_status: post.post_status || post.status,
            image: post.media && post.media.length ? API.getImageUrl(post.media[0].media) : null,
            authorImage: post.created_by?.picture ? API.getImageUrl(post.created_by.picture) : null,
            isReposted: true // Explicitly mark all posts from this API as reposted
          };
          
          return formattedPost;
        });
        
        console.log('[POST SECTION] First formatted post after mapping:', formattedPosts[0]);
        
        // Update the posts state with reposted posts
        if (setPosts && typeof setPosts === 'function') {
          setPosts(formattedPosts);
          console.log('[POST SECTION] Posts state updated with formatted posts');
        } else {
          console.error('[POST SECTION] setPosts is not a function or not available');
        }
        
        console.log(`[POST SECTION] Updated posts with ${formattedPosts.length} reposted posts`);
        
        // Manually set the filter to reposted to ensure correct UI state
        if (onFilterChange && typeof onFilterChange === 'function') {
          onFilterChange("reposted");
        }
      } else {
        // If no posts returned or empty array, still update the state
        setPosts([]);
        console.log(`[POST SECTION] No reposted posts found in API response`);
        
        // Still set filter to reposted to update UI state
        if (onFilterChange && typeof onFilterChange === 'function') {
          onFilterChange("reposted");
        }
      }
    } catch (error) {
      console.error('[POST SECTION] Error fetching reposted posts:', error);
      // On error, set empty array to avoid showing old data
      setPosts([]);
    }
  };

  const handleAllClick = () => handleFilterButtonClick("all");

  const handlePageChange = (page) => {
    if (onPageChange && typeof onPageChange === 'function') {
      onPageChange(page);
    }
  };

  // Search function
  const handleSearch = (term) => {
    // Always update local state to keep the input field in sync
    setSearchTerm(term);
    
    // Store the current search term to preserve it across renders
    window.currentSearchTerm = term;
    
    // Only show the searching indicator if we have input
    if (term && term.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
    
    // Reset to page 1 when searching, but only if we have a term
    if (onPageChange && term && term.trim()) {
      onPageChange(1);
    }
    
    // If we have a parent search function, just pass the term along
    // The parent will handle debouncing and deciding when to search
    if (searchPosts) {
      searchPosts(term, activeFilter);
    }
    
    // Clear searching state after a brief moment for UI feedback
    if (term && term.trim()) {
      setTimeout(() => {
        setIsSearching(false);
      }, 300);
    }
  };

  // Helper functions
  const getUserAvatar = (post) => {
    if (post?.authorImage &&
      post.authorImage !== "https://stage.suniyenetajee.comnull" &&
      post.authorImage !== "https://stage.suniyenetajee.com/") {
      return post.authorImage;
    }
    return null;
  };

  // Updated isAdminPost function that actually checks for admin status
  const isAdminPost = (post) => {
    if (!post) return false;
    
    try {
      // Get the logged-in user ID from localStorage
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        // Check if the post's authorId matches the logged-in user's ID
        return userData.userId && post.authorId && post.authorId === userData.userId;
      }
    } catch (e) {
      console.error("[PostSection] Error checking admin post:", e);
    }
    
    return false;
  };

  const canConfirmAction = (reason, comment, isRemarkRequired) => {
    // If remark is required, comment must not be empty
    if (isRemarkRequired && !comment.trim()) {
      return false;
    }
    // Otherwise it's valid
    return true;
  };

  // Filtered posts based on active filter
  const filteredPosts = () => {
    console.log(`[FILTERED POSTS] Active filter: ${activeFilter}, Total posts: ${posts.length}`);
    
    let result;
    switch (activeFilter) {
      case "all": 
        result = posts;
        break;
      case "review": 
        result = posts.filter(post => post.post_status !== "approved" && !post.flagged && !post.isDeleted);
        break;
      case "approved": 
        result = posts.filter(post => post.post_status === "approved");
        break;
      case "reposted":
        // More thorough check for reposted posts
        result = posts.filter(post => 
          post.isReposted === true || 
          post.title?.toLowerCase().includes("repost") || 
          post.content?.toLowerCase().includes("repost") ||
          post.reposted_from
        );
        console.log(`[FILTERED POSTS] Found ${result.length} reposted posts`);
        if (result.length > 0) {
          console.log('[FILTERED POSTS] Sample reposted post:', {
            id: result[0].id,
            title: result[0].title,
            reposted_from: result[0].reposted_from,
            isReposted: result[0].isReposted
          });
        } else {
          console.log('[FILTERED POSTS] No reposted posts found in current posts array');
          console.log('[FILTERED POSTS] Current posts array:', posts);
        }
        break;
      case "flagged": 
        result = posts.filter(post => post.flagged || post.post_status === "flagged" || post.post_status === "red_flag");
        console.log(`[FILTERED POSTS] Found ${result.length} flagged posts`);
        if (result.length > 0) {
          console.log('[FILTERED POSTS] Sample flagged post:', {
            id: result[0].id,
            flagged: result[0].flagged,
            post_status: result[0].post_status
          });
        } else {
          console.log('[FILTERED POSTS] No flagged posts found in current posts array');
          // Log all post statuses to debug
          const postStatuses = posts.map(p => ({ id: p.id, flagged: p.flagged, post_status: p.post_status }));
          console.log('[FILTERED POSTS] All post statuses:', postStatuses);
        }
        break;
      case "deleted": 
        result = posts.filter(post => post.isDeleted || post.post_status === "rejected");
        console.log(`[FILTERED POSTS] Found ${result.length} deleted posts`);
        if (result.length > 0) {
          console.log('[FILTERED POSTS] Sample deleted post:', {
            id: result[0].id,
            isDeleted: result[0].isDeleted,
            post_status: result[0].post_status
          });
        } else {
          console.log('[FILTERED POSTS] No deleted posts found in current posts array');
          // Log all post statuses to debug
          const postStatuses = posts.map(p => ({ id: p.id, isDeleted: p.isDeleted, post_status: p.post_status }));
          console.log('[FILTERED POSTS] All post statuses:', postStatuses);
        }
        break;
      default: 
        result = posts;
    }
    
    return result;
  };

  // Handle delete button click
  const handleDeleteButtonClick = (post) => {
    setSelectedPost(post);
    
    // If post is already deleted, show restore modal instead
    if (post.isDeleted || post.post_status === "rejected") {
      setShowRestoreModal(true);
    } else {
      // Otherwise show the normal delete modal
      setShowDeleteModal(true);
    }
  };

  // Restore a deleted post
  const handleRestorePost = async () => {
    if (!selectedPost) return;
    
    try {
      console.log(`[RESTORE] Attempting to restore post ID: ${selectedPost.id}`);
      
      // Call the API to approve the post (reverses the deletion)
      const response = await API.updatePostStatus(
        selectedPost.id,
        "approve", // Use approve action to restore the post
        1, // Default reason ID for approval
        "" // No remarks needed for restoration
      );
      
      console.log(`[RESTORE] Success! API response:`, response);
      
      // Update the local state
      setPosts(posts.map(p => p.id === selectedPost.id ?
        { 
          ...p, 
          isDeleted: false, 
          post_status: "approved", // Mark as approved
          deleteComment: null, 
          deleteReason: null,
          deleteReasonId: null,
          deleteReasonData: null
        } : p));
      
      // Show success message or notification
      console.log("Post successfully restored");
        
    } catch (error) {
      console.error("[RESTORE] Error restoring post:", error);
      // Optionally show an error notification here
    } finally {
      // Reset the UI state
      setShowRestoreModal(false);
      setSelectedPost(null);
    }
  };

  return (
    <div>
      <Container fluid className="p-0">
        {/* Search bar when in dashboard mode */}
        {inDashboard && (
          <div className="mb-3 px-2">
            <InputGroup style={{ maxWidth: '500px', margin: '20px auto 10px' }}>
              <InputGroup.Text id="search-addon" style={{ background: '#f8f9fa', border: '1px solid #ced4da', borderRight: 'none' }}>
                <FaSearch style={{ color: '#6c757d' }} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search posts..."
                aria-label="Search"
                aria-describedby="search-addon"
                value={window.currentSearchTerm || searchTerm} 
                onChange={(e) => handleSearch(e.target.value)}
                style={{ border: '1px solid #ced4da', borderLeft: 'none', boxShadow: 'none' }}
              />
            </InputGroup>
          </div>
        )}
        
        <Row className="g-4">
          {/* Posts Under Review Card - Left Side */}
          <Col lg={inDashboard ? 12 : 8}>
            <ManagePost
              posts={posts}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalPosts={totalPosts}
              approvedPosts={approvedPosts}
              activeFilter={activeFilter}
              handleAllClick={handleAllClick}
              handleFilterButtonClick={handleFilterButtonClick}
              handleApprovePost={handleApprovePost}
              handleFlagButtonClick={handleFlagButtonClick}
              handleRepost={handleRepost}
              setSelectedPost={setSelectedPost}
              handleDeleteButtonClick={handleDeleteButtonClick}
              setShowPostDetailModal={setShowPostDetailModal}
              approvingPostId={approvingPostId}
              flaggingPostId={flaggingPostId}
              repostingPostId={repostingPostId}
              getCurrentFilteredPosts={() => filteredPosts()}
              filteredPosts={filteredPosts}
              getUserAvatar={getUserAvatar}
              setShowNewPostModal={setShowNewPostModal}
              error={error}
              ordering={ordering}
              onOrderingChange={onOrderingChange}
              isSearching={isSearching}
            />
          </Col>

          {/* Filter & Moderation Card - Right Side */}
          {!inDashboard && (
            <Col lg={4}>
              <FilterAndModeration
                activeFilter={activeFilter}
                handleFilterButtonClick={handleFilterButtonClick}
                handleAllClick={handleAllClick}
                searchPosts={handleSearch}
                posts={posts}
              />
              <QuickAdminActions />
            </Col>
          )}
        </Row>

        {/* Modals */}
        <FlagModal
          show={showFlagModal}
          onHide={() => {
            setShowFlagModal(false);
            setFlagComment('');
            setFlagReason('');
            setFlagReasonId(null);
          }}
          selectedPost={selectedPost}
          flagReason={flagReason}
          setFlagReason={setFlagReason}
          flagReasonId={flagReasonId}
          setFlagReasonId={setFlagReasonId}
          flagComment={flagComment}
          setFlagComment={setFlagComment}
          confirmFlag={confirmFlag}
          canConfirmAction={canConfirmAction}
        />

        <DeleteModal
          show={showDeleteModal}
          onHide={() => {
            setShowDeleteModal(false);
            setDeleteComment('');
            setDeleteReason('');
            setDeleteReasonId(null);
          }}
          selectedPost={selectedPost}
          deleteReason={deleteReason}
          setDeleteReason={setDeleteReason}
          deleteReasonId={deleteReasonId}
          setDeleteReasonId={setDeleteReasonId}
          deleteComment={deleteComment}
          setDeleteComment={setDeleteComment}
          onConfirmDelete={async () => {
            try {
              // Call the API to reject/delete the post
              await API.updatePostStatus(
                selectedPost.id,
                "reject",
                deleteReasonId,
                deleteComment
              );
              
              // Update the local state
              setPosts(posts.map(p => p.id === selectedPost?.id ?
                { 
                  ...p, 
                  isDeleted: true, 
                  post_status: "rejected",
                  deleteComment, 
                  deleteReason,
                  deleteReasonId,
                  deleteReasonData: {
                    id: deleteReasonId,
                    name: deleteReason,
                    comment: deleteComment
                  }
                } : p));
                
            } catch (error) {
              console.error("Error deleting post:", error);
              // Optionally show an error notification here
            } finally {
              // Reset the UI state
              setShowDeleteModal(false);
              setDeleteComment('');
              setDeleteReason('');
              setDeleteReasonId(null);
            }
          }}
          canConfirmAction={canConfirmAction}
        />

        <RestorePostModal
          show={showRestoreModal}
          onHide={() => setShowRestoreModal(false)}
          selectedPost={selectedPost}
          onConfirmRestore={handleRestorePost}
        />

        <PostDetailModal
          show={showPostDetailModal}
          onHide={() => {
            setShowPostDetailModal(false);
            setIsEditMode(false);
          }}
          selectedPost={selectedPost}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          editedPost={editedPost}
          handleEditChange={handleEditChange}
          saveEditedPost={saveEditedPost}
          cancelEditing={cancelEditing}
          enableEditMode={enableEditMode}
          isAdminPost={isAdminPost}
        />

        <CreatePostModal
          show={showNewPostModal}
          onHide={() => setShowNewPostModal(false)}
          newPost={newPost}
          handleNewPostChange={handleNewPostChange}
          validateForm={validateForm}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          setPosts={setPosts}
        />
      </Container>
    </div>
  );
};

export default PostSection;
