import React, { useState, useRef, useEffect } from "react";
import "../../../assets/css/Dashboard.css";
import { Card, Row, Col } from "react-bootstrap";
import { FaSearch, FaFlag, FaCheck, FaListUl, FaShareSquare } from "react-icons/fa";
import { FiTrash, FiFlag, FiClock as FiClockIcon } from "react-icons/fi";
import BootstrapButton from "../../../components/common/BootstrapButton";
import { useView } from "../../../context/ViewContext";

const FilterAndModeration = ({
  activeFilter,
  handleFilterButtonClick,
  handleAllClick,
  searchPosts,
  posts = []
}) => {
  // State for tracking hover
  const [hoveredButton, setHoveredButton] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeoutRef = useRef(null);
  const { currentView, setCurrentView } = useView();

  // Helper function to get flagged posts
  const getFlaggedPosts = () => {
    const flaggedPosts = posts.filter(post => post.flagged || post.post_status === "flagged");
    console.log('[FLAGGED POSTS] Total flagged posts:', flaggedPosts.length);
    console.log('[FLAGGED POSTS] List of flagged posts:', flaggedPosts);
    return flaggedPosts;
  };

  // Helper function to get deleted posts
  const getDeletedPosts = () => {
    const deletedPosts = posts.filter(post => post.isDeleted || post.post_status === "rejected");
    console.log('[DELETED POSTS] Total deleted posts:', deletedPosts.length);
    console.log('[DELETED POSTS] List of deleted posts:', deletedPosts);
    return deletedPosts;
  };

  // Common style for button borders
  const buttonStyle = (buttonName, isActive, bgColor) => ({
    backgroundColor: hoveredButton === buttonName && !isActive
      ? "#f8f9fa"
      : isActive
        ? bgColor
        : "#ffffff",
    color: isActive ? "#ffffff" : "#000000",
    borderColor: isActive ? bgColor : "#dee2e6",
    borderWidth: "1px",
    borderStyle: "solid",
    gap: "8px",
    transition: "all 0.2s ease",
    height: "100%",
    minHeight: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

  // Custom filter click handler that always resets to posts view
  const handleFilterClick = (filter) => {
    // Reset to posts view and apply the filter
    setCurrentView('posts');
    handleFilterButtonClick(filter);
  };

  // Custom "Show All" click handler that always resets to posts view
  const handleShowAllClick = () => {
    // Reset to posts view and show all posts
    setCurrentView('posts');
    handleAllClick();
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set a new timeout to debounce the search
    searchTimeoutRef.current = setTimeout(() => {
      // Call the searchPosts function with the search term after debounce
      if (searchPosts) {
        // If there's content in the search field, switch to posts view
        if (value.trim() !== '') {
          setCurrentView('posts');
        }
        searchPosts(value, activeFilter);
      }
    }, 500); // 500ms debounce
  };

  // Clean up the timeout when component unmounts
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Body>
        <h4 className="fw-bold mb-4">Filter & Moderation</h4>

        {/* Search Input with Icon */}
        <div className="position-relative mb-3">
          <input
            type="text"
            placeholder="Search by keyword..."
            className="form-control ps-5"
            value={searchTerm}
            onChange={handleSearch}
            style={{
              color: "#212529",
              fontSize: "13px",
              fontWeight: "bold",
              border: "1px solid #ced4da",
              borderRadius: "4px",
              padding: "8px 12px",
              width: "100%",
              height: "38px",
            }}
          />
          <div
            className="position-absolute"
            style={{
              top: "50%",
              left: "10px",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FaSearch style={{ color: "#6c757d" }} />
          </div>
        </div>

        {/* Responsive Grid Layout for Buttons */}
        <Row className="g-2 mb-2">
          {/* Show All Button */}
          <Col xs={6} sm={6} md={6}>
            <BootstrapButton
              variant={activeFilter === "all" ? "primary" : "light"}
              className="w-100"
              style={buttonStyle("all", activeFilter === "all", "#000000")}
              onClick={handleShowAllClick}
              onMouseEnter={() => setHoveredButton("all")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FaListUl style={{ color: activeFilter === "all" ? "#ffffff" : "#000000", marginRight: "8px" }} />
              <span className="d-none d-sm-inline">Show All</span>
              <span className="d-inline d-sm-none">All</span>
            </BootstrapButton>
          </Col>

          {/* Under Review Button */}
          <Col xs={6} sm={6} md={6}>
            <BootstrapButton
              variant={activeFilter === "review" ? "warning" : "light"}
              className="w-100"
              style={buttonStyle("review", activeFilter === "review", "#ffc107")}
              onClick={() => handleFilterClick("review")}
              onMouseEnter={() => setHoveredButton("review")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FiClockIcon style={{ color: "#000000", marginRight: "8px" }} />
              <span className="d-none d-sm-inline">Under Review</span>
              <span className="d-inline d-sm-none">Review</span>
            </BootstrapButton>
          </Col>

          {/* Approved Posts Button */}
          <Col xs={6} sm={6} md={6}>
            <BootstrapButton
              variant={activeFilter === "approved" ? "success" : "light"}
              className="w-100"
              style={buttonStyle("approved", activeFilter === "approved", "var(--bs-success)")}
              onClick={() => handleFilterClick("approved")}
              onMouseEnter={() => setHoveredButton("approved")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FaCheck style={{ color: activeFilter === "approved" ? "#ffffff" : "var(--bs-success)", marginRight: "8px" }} />
              <span className="d-none d-sm-inline">Approved Posts</span>
              <span className="d-inline d-sm-none">Approved</span>
            </BootstrapButton>
          </Col>

          {/* Flagged Posts Button */}
          <Col xs={6} sm={6} md={6}>
            <BootstrapButton
              variant={activeFilter === "flagged" ? "warning" : "light"}
              className="w-100"
              style={buttonStyle("flagged", activeFilter === "flagged", "#fd7e14")}
              onClick={() => {
                console.log('[FILTER] Flagged button clicked');
                getFlaggedPosts();
                console.log('[FILTER] Calling handleFilterButtonClick with: "flagged"');
                // Always reset to posts view
                setCurrentView('posts');
                handleFilterButtonClick("flagged");
              }}
              onMouseEnter={() => setHoveredButton("flagged")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FiFlag style={{ color: activeFilter === "flagged" ? "#ffffff" : "#fd7e14", marginRight: "8px" }} />
              <span className="d-none d-sm-inline">Flagged Posts</span>
              <span className="d-inline d-sm-none">Flagged</span>
            </BootstrapButton>
          </Col>

          {/* Reposted Posts Button */}
          <Col xs={6} sm={6} md={6}>
            <BootstrapButton
              variant={activeFilter === "reposted" ? "success" : "light"}
              className="w-100"
              style={buttonStyle("reposted", activeFilter === "reposted", "var(--bs-success)")}
              onClick={() => {
                console.log('[FILTER] Reposted button clicked');
                console.log('[FILTER] This will trigger API call to fetch reposted posts');
                // Always reset to posts view
                setCurrentView('posts');
                handleFilterButtonClick("reposted");
              }}
              onMouseEnter={() => setHoveredButton("reposted")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FaShareSquare style={{ color: activeFilter === "reposted" ? "#ffffff" : "var(--bs-success)", marginRight: "8px" }} />
              <span className="d-none d-sm-inline">Reposted Posts</span>
              <span className="d-inline d-sm-none">Reposted</span>
            </BootstrapButton>
          </Col>

          {/* Deleted Posts Button */}
          <Col xs={6} sm={6} md={6}>
            <BootstrapButton
              variant={activeFilter === "deleted" ? "danger" : "light"}
              className="w-100"
              style={buttonStyle("deleted", activeFilter === "deleted", "#dc3545")}
              onClick={() => {
                console.log('[FILTER] Deleted button clicked');
                getDeletedPosts();
                console.log('[FILTER] Calling handleFilterButtonClick with: "deleted"');
                // Always reset to posts view
                setCurrentView('posts');
                handleFilterButtonClick("deleted");
              }}
              onMouseEnter={() => setHoveredButton("deleted")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FiTrash style={{ color: activeFilter === "deleted" ? "#ffffff" : "#dc3545", marginRight: "8px" }} />
              <span className="d-none d-sm-inline">Deleted Posts</span>
              <span className="d-inline d-sm-none">Deleted</span>
            </BootstrapButton>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default FilterAndModeration;
