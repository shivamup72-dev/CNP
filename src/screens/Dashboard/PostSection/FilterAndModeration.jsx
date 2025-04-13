import React, { useState } from "react";
import "../../../assets/css/Dashboard.css";
import { Card, Row, Col } from "react-bootstrap";
import { FaSearch, FaFlag, FaCheck, FaListUl } from "react-icons/fa";
import { FiTrash, FiFlag, FiClock as FiClockIcon } from "react-icons/fi";
import BootstrapButton from "../../../components/common/BootstrapButton";

const FilterAndModeration = ({
  activeFilter,
  handleFilterButtonClick,
  handleAllClick
}) => {
  // State for tracking hover
  const [hoveredButton, setHoveredButton] = useState(null);

  // Common style for button borders
  const buttonStyle = (buttonName, isActive, bgColor) => ({
    backgroundColor: hoveredButton === buttonName && !isActive
      ? "#f8f9fa"
      : isActive
        ? bgColor
        : "#ffffff",
    color: isActive ? "#ffffff" : "#000000",
    borderColor: "#6c757d",
    gap: "8px",
    transition: "background-color 0.2s ease",
    height: "100%",
    minHeight: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

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
              onClick={handleAllClick}
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
              onClick={() => handleFilterButtonClick("review")}
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
              style={buttonStyle("approved", activeFilter === "approved", "#28a745")}
              onClick={() => handleFilterButtonClick("approved")}
              onMouseEnter={() => setHoveredButton("approved")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FaCheck style={{ color: activeFilter === "approved" ? "#ffffff" : "#28a745", marginRight: "8px" }} />
              <span className="d-none d-sm-inline">Approved Posts</span>
              <span className="d-inline d-sm-none">Approved</span>
            </BootstrapButton>
          </Col>

          {/* Flagged Posts Button */}
          <Col xs={6} sm={6} md={6}>
            <BootstrapButton
              variant={activeFilter === "flagged" ? "danger" : "light"}
              className="w-100"
              style={buttonStyle("flagged", activeFilter === "flagged", "#dc3545")}
              onClick={() => handleFilterButtonClick("flagged")}
              onMouseEnter={() => setHoveredButton("flagged")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FiFlag style={{ color: activeFilter === "flagged" ? "#ffffff" : "#dc3545", marginRight: "8px" }} />
              <span className="d-none d-sm-inline">Flagged Posts</span>
              <span className="d-inline d-sm-none">Flagged</span>
            </BootstrapButton>
          </Col>

          {/* Deleted Posts Button */}
          <Col xs={12} sm={12} md={12}>
            <BootstrapButton
              variant={activeFilter === "deleted" ? "secondary" : "light"}
              className="w-100"
              style={buttonStyle("deleted", activeFilter === "deleted", "#6c757d")}
              onClick={() => handleFilterButtonClick("deleted")}
              onMouseEnter={() => setHoveredButton("deleted")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FiTrash style={{ color: activeFilter === "deleted" ? "#ffffff" : "#6c757d", marginRight: "8px" }} />
              <span>Deleted Posts</span>
            </BootstrapButton>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default FilterAndModeration;
