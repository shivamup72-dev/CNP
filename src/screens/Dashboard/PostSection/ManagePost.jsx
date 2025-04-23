import React, { useState, useEffect, useRef } from "react";
import "../../../assets/css/Dashboard.css";
import { Card } from "react-bootstrap";
import { FaCheck, FaListUl, FaShareSquare } from "react-icons/fa";
import { FiFlag } from "react-icons/fi";
import toast from 'react-hot-toast';
import PostTable from "./PostTable";
import CustomPagination from "../../../components/common/CustomPagination";
import Button from "../../../components/common/BootstrapButton";

// Common button styles
const buttonBaseStyle = {
  transition: "all 0.2s ease",
};

const filterButtonStyle = (isActive) => ({
  ...buttonBaseStyle,
  borderColor: "#6c757d",
  backgroundColor: isActive ? "#000" : "transparent",
  color: isActive ? "white" : "#000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px"
});

// Common section styling for consistent spacing
const sectionStyle = {
  padding: "0.5rem",
  paddingLeft: "0.75rem",
  paddingRight: "0.75rem"
};

const ManagePost = ({
  posts = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalPosts = 0,
  approvedPosts = [],
  activeFilter = "all",
  handleAllClick,
  handleFilterButtonClick,
  handleApprovePost,
  handleFlagButtonClick,
  handleRepost,
  setSelectedPost,
  handleDeleteButtonClick,
  setShowPostDetailModal,
  approvingPostId,
  flaggingPostId,
  repostingPostId,
  getCurrentFilteredPosts,
  filteredPosts,
  getUserAvatar,
  setShowNewPostModal,
  error = null,
  ordering = "newest",
  onOrderingChange,
  onSearch,
  isSearching
}) => {
  const [selectedButton, setSelectedButton] = useState(ordering === "newest" ? 'New' : 'Old');
  const [localIsSearching, setLocalIsSearching] = useState(false);

  const handleButtonClick = (button) => {
    setSelectedButton(button);
    // Reset to page 1 when changing ordering
    onPageChange(1);
    onOrderingChange(button === 'New' ? 'newest' : 'oldest');
  };

  const getFilterTitle = () => {
    const titles = {
      all: "Manage Posts",
      review: "Under Review Posts",
      flagged: "Flagged Posts",
      approved: "Approved Posts",
      reposted: "Reposted Posts"
    };
    return titles[activeFilter] || "Manage Posts";
  };

  const handleNewPost = () => {
    setShowNewPostModal(true);
    // Reset create button style when modal opens
    setTimeout(() => {
      const createButton = document.getElementById('createPostButton');
      if (createButton) {
        createButton.style.backgroundColor = 'white';
        createButton.style.color = 'black';
      }
    }, 50);
  };

  return (
    <div>
      <Card className="border-0 shadow-sm" style={{ marginTop: "0" }}>
        <Card.Body className="p-0">
          {/* Header with consistent margin */}
          <div className="d-flex flex-wrap justify-content-between align-items-center" style={sectionStyle}>
            <h5 className="fw-bold mb-0 me-2">{getFilterTitle()}</h5>
            <div className="d-flex gap-2">
              <Button
                variant={selectedButton === 'New' ? "success" : "outline-success"}
                size="sm"
                className="px-3 new-post-btn"
                style={{
                  minWidth: "60px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: selectedButton === 'New' ? "var(--bs-success)" : "#fff",
                  color: selectedButton === 'New' ? "#fff" : "var(--bs-success)",
                  borderColor: "var(--bs-success)"
                }}
                onClick={() => handleButtonClick('New')}
              >
                New
              </Button>
              <Button
                variant={selectedButton === 'Old' ? "success" : "outline-success"}
                size="sm"
                className="px-3 new-post-btn"
                style={{
                  minWidth: "60px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: selectedButton === 'Old' ? "var(--bs-success)" : "#fff",
                  color: selectedButton === 'Old' ? "#fff" : "var(--bs-success)",
                  borderColor: "var(--bs-success)"
                }}
                onClick={() => handleButtonClick('Old')}
              >
                Old
              </Button>
              <Button
                variant="dark"
                size="sm"
                className="px-3 new-post-btn"
                onClick={handleNewPost}
                onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                onMouseOut={(e) => e.currentTarget.style.opacity = "1.0"}
              >
                + New Post
              </Button>
            </div>
          </div>

          {/* Filter buttons with consistent spacing */}
          <div className="d-flex flex-wrap justify-content-between align-items-center" style={sectionStyle}>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <Button
                variant={activeFilter === "all" ? "dark" : "outline-dark"}
                size="sm"
                className="filter-btn"
                onClick={handleAllClick}
              >
                <FaListUl style={{ marginRight: "4px" }} />
                All Posts
              </Button>
              <Button
                variant={activeFilter === "approved" ? "dark" : "outline-dark"}
                size="sm"
                className="filter-btn"
                onClick={() => handleFilterButtonClick("approved")}
              >
                <FaCheck style={{ marginRight: "4px" }} />
                Approved
              </Button>
            </div>
            <div className="text-muted small">
              Showing {filteredPosts().length} of {totalPosts} posts
            </div>
          </div>

          {/* Posts Table with consistent margin */}
          <div style={sectionStyle}>
            <PostTable
              currentPage={currentPage}
              getCurrentFilteredPosts={getCurrentFilteredPosts}
              setSelectedPost={setSelectedPost}
              setShowPostDetailModal={setShowPostDetailModal}
              getUserAvatar={getUserAvatar}
              handleApprovePost={handleApprovePost}
              handleFlagButtonClick={handleFlagButtonClick}
              handleRepost={handleRepost}
              handleDeleteButtonClick={handleDeleteButtonClick}
              approvingPostId={approvingPostId}
              flaggingPostId={flaggingPostId}
              repostingPostId={repostingPostId}
              error={error}
              isSearching={isSearching || localIsSearching}
              activeFilter={activeFilter}
            />
          </div>

          {/* Pagination */}
          {getCurrentFilteredPosts().length > 0 ? (
            <div className="d-flex flex-column align-items-center mt-2 mb-2 px-3">
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalPosts}
                itemsPerPage={100}
                onPageChange={onPageChange}
                className="w-100"
              />
            </div>
          ) : (
            <div className="text-center text-muted mt-3 mb-2">
              No posts found matching your current filters
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ManagePost; 
