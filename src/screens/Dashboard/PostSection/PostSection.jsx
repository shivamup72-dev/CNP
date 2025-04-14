import React, { useState } from "react";
import "../../../assets/css/Dashboard.css";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DeleteModal from '../../../components/modals/DeleteModal';
import FlagModal from '../../../components/modals/FlagModal';
import PostDetailModal from '../../../components/modals/PostDetailModal';
import CreatePostModal from '../../../components/modals/CreatePostModal';
import ManagePost from './ManagePost';
import FilterAndModeration from './FilterAndModeration';
import QuickAdminActions from './QuickAdminActions';
import { formatDateForAPI } from "../../../utils/DateUtility";

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
  error = null
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

  // Form states
  const [flagComment, setFlagComment] = useState('');
  const [deleteComment, setDeleteComment] = useState('');
  const [flagReason, setFlagReason] = useState('Hate speech or discrimination');
  const [deleteReason, setDeleteReason] = useState('Hate speech or discrimination');
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
  const handleApprovePost = (postId) => {
    setApprovingPostId(postId);
    setTimeout(() => {
      setPosts(posts.map(post => post.id === postId ?
        { ...post, post_status: "approved" } : post));
      setApprovingPostId(null);
    }, 500);
  };

  const handleFlagButtonClick = (post) => {
    if (post.flagged) {
      setPosts(posts.map(p => p.id === post.id ? { ...p, flagged: false } : p));
    } else {
      setSelectedPost(post);
      setShowFlagModal(true);
    }
  };

  const confirmFlag = () => {
    if (!selectedPost) return;
    setPosts(posts.map(p => p.id === selectedPost.id ?
      { ...p, flagged: true, flagComment, flagReason } : p));
    setShowFlagModal(false);
    setSelectedPost(null);
    setFlagComment('');
    setFlagReason('Hate speech or discrimination');
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
    if (onFilterChange) onFilterChange(filter);
  };

  const handleAllClick = () => handleFilterButtonClick("all");

  const handlePageChange = (page) => {
    if (onPageChange && typeof onPageChange === 'function') {
      onPageChange(page);
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

  const canConfirmAction = (reason, comment) => {
    return reason !== 'Other (please specify)' || comment.trim().length > 0;
  };

  // Filtered posts based on active filter
  const filteredPosts = () => {
    switch (activeFilter) {
      case "all": return posts;
      case "review": return posts.filter(post => post.post_status !== "approved" && !post.flagged);
      case "approved": return posts.filter(post => post.post_status === "approved");
      case "flagged": return posts.filter(post => post.flagged);
      case "deleted": return posts.filter(post => post.isDeleted);
      default: return posts;
    }
  };

  return (
    <div>
      <Container fluid className="p-0">
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
              getCurrentFilteredPosts={() => filteredPosts()}
              filteredPosts={filteredPosts}
              getUserAvatar={getUserAvatar}
              setShowNewPostModal={setShowNewPostModal}
              error={error}
            />
          </Col>

          {/* Filter & Moderation Card - Right Side */}
          {!inDashboard && (
            <Col lg={4}>
              <FilterAndModeration
                activeFilter={activeFilter}
                handleFilterButtonClick={handleFilterButtonClick}
                handleAllClick={handleAllClick}
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
            setFlagReason('Hate speech or discrimination');
          }}
          selectedPost={selectedPost}
          flagReason={flagReason}
          setFlagReason={setFlagReason}
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
            setDeleteReason('Hate speech or discrimination');
          }}
          selectedPost={selectedPost}
          deleteReason={deleteReason}
          setDeleteReason={setDeleteReason}
          deleteComment={deleteComment}
          setDeleteComment={setDeleteComment}
          onConfirmDelete={() => {
            setPosts(posts.map(p => p.id === selectedPost?.id ?
              { ...p, isDeleted: true, deleteComment, deleteReason } : p));
            setShowDeleteModal(false);
            setDeleteComment('');
            setDeleteReason('Hate speech or discrimination');
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
