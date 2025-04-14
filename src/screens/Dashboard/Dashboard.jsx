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

  const [modalState, setModalState] = useState({
    flag: { show: false, reason: "Hate speech or discrimination", comment: "" },
    delete: { show: false, reason: "Hate speech or discrimination", comment: "" },
    postDetail: { show: false, isEditMode: false },
    newPost: { show: false }
  });

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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Map the filter to the correct status value
        const statusMap = {
          "all": "all",
          "approved": "approved",
          "under-review": "pending",
          "flagged": "rejected",
          "deleted": "red_flag"
        };

        const status = statusMap[activeFilter] || "all";
        const url = `${API.BASE_URL}${API.ENDPOINTS.POSTS}?status=${status}`;
        console.log(`[DASHBOARD] API Request: GET ${url}`);
        const res = await fetch(url, { headers: API.getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        console.log(`[DASHBOARD] API Response:`, {
          url: url,
          status: res.status,
          count: data.count,
          results: data.results,
          next: data.next,
          previous: data.previous
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
          flagged: p.flagged || false,
          flagReason: p.flagReason,
          flagComment: p.flagComment,
          authorImage: API.getImageUrl(p.created_by.picture),
          isApproved: p.post_status === "approved"
        }));

        setPosts(formattedPosts);
      } catch (err) {
        console.error(`[DASHBOARD] API Error:`, {
          url: url,
          error: err.message,
          stack: err.stack
        });
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage, activeFilter]);

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
        Welcome, <strong>Shri Venkateshwara</strong> (Reporter) - Delhi
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
            onFilterChange={setActiveFilter}
            error={error}
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
