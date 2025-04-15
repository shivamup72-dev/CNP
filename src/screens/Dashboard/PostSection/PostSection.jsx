import React, { useState } from "react";
import "../../../assets/css/Dashboard.css";
import { Container, Row, Col, InputGroup, Form } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DeleteModal from '../../../components/modals/DeleteModal';
import FlagModal from '../../../components/modals/FlagModal';
import PostDetailModal from '../../../components/modals/PostDetailModal';
import CreatePostModal from '../../../components/modals/CreatePostModal';
import ManagePost from './ManagePost';
import FilterAndModeration from './FilterAndModeration';
import QuickAdminActions from './QuickAdminActions';
import { formatDateForAPI } from "../../../utils/DateUtility";
import API from '../../../api/endpoint';

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
    title: '',
    content: '',
    author: '',
    category: '',
    image: '',
    imageFile: null,
    imagePreview: ''
  });

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
    } catch (error) {
      console.error("Error approving post:", error);
      // Optionally show an error notification here
    } finally {
      // Clear the approving state after a short delay for UI feedback
      setTimeout(() => {
        setApprovingPostId(null);
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

  // New post functions
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost({
          ...newPost,
          imageFile: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
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
    if (!newPost.title.trim()) errors.title = "Title is required";
    if (!newPost.content.trim()) errors.content = "Content is required";
    if (!newPost.author.trim()) errors.author = "Author name is required";
    if (!newPost.category) errors.category = "Category is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreatePost = () => {
    if (!validateForm()) return;
    setLoading(true);
    const createdPost = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: newPost.author,
      category: newPost.category,
      image: newPost.imagePreview || null,
      date: formatDateForAPI(new Date()),
      post_status: "pending",
    };
    setPosts([createdPost, ...posts]);
    setTimeout(() => {
      setLoading(false);
      setNewPost({
        title: '', content: '', author: '', category: '',
        image: '', imageFile: null, imagePreview: ''
      });
      setShowNewPostModal(false);
    }, 500);
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
    
    console.log(`[POST SECTION] Filter button clicked: ${filter}, calling onFilterChange`);
    if (onFilterChange && typeof onFilterChange === 'function') {
      onFilterChange(filter);
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
    setSearchTerm(term);
    // Set searching state if term is not empty
    if (term.trim()) {
      setIsSearching(true);
    }
    
    // Reset to page 1 when searching
    if (onPageChange) {
      onPageChange(1);
    }
    
    // Call the parent's search function if provided
    if (searchPosts) {
      searchPosts(term, activeFilter);
      
      // Clear the searching state after a short delay
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

  const isAdminPost = () => false;

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

  return (
    <div>
      <Container fluid className="p-0">
        {/* Search bar when in dashboard mode */}
        {inDashboard && (
          <div className="mb-3 px-2">
            <InputGroup>
              <InputGroup.Text id="search-addon">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search posts..."
                aria-label="Search"
                aria-describedby="search-addon"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
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
              setSelectedPost={setSelectedPost}
              setShowDeleteModal={setShowDeleteModal}
              setShowPostDetailModal={setShowPostDetailModal}
              approvingPostId={approvingPostId}
              flaggingPostId={flaggingPostId}
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
          handleImageUpload={handleImageUpload}
          handleCreatePost={handleCreatePost}
          validateForm={validateForm}
          formErrors={formErrors}
        />
      </Container>
    </div>
  );
};

export default PostSection;
