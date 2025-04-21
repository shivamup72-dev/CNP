import React, { useState } from "react";
import "../../../assets/css/Dashboard.css";
import { Card, Row, Col } from "react-bootstrap";
import { FaFlag, FaClipboardCheck, FaCity, FaPoll, FaFileSignature, FaComments } from "react-icons/fa";
import BootstrapButton from "../../../components/common/BootstrapButton";

const QuickAdminActions = () => {
  // State for tracking hover
  const [hoveredButton, setHoveredButton] = useState(null);

  // Common button style
  const buttonStyle = (buttonName) => ({
    fontSize: "0.9rem",
    borderColor: "#6c757d",
    backgroundColor: hoveredButton === buttonName ? "#f8f9fa" : "#ffffff",
    transition: "background-color 0.2s ease",
    height: "100%",
    minHeight: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Body>
        <h4 className="fw-bold mb-4">Quick Admin Actions</h4>

        {/* Responsive Grid Layout for Action Buttons */}
        <Row className="g-2">
          {/* Manage Reports Button */}
          <Col xs={6} sm={6} md={6}>
            <BootstrapButton
              variant="light"
              className="w-100 py-2"
              style={buttonStyle("reports")}
              onMouseEnter={() => setHoveredButton("reports")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FaFlag style={{ color: "#dc3545", marginRight: "8px" }} />
              <span className="d-none d-sm-inline">Manage Reports</span>
              <span className="d-inline d-sm-none">Reports</span>
            </BootstrapButton>
          </Col>

          {/* Content Audit Button */}
          <Col xs={6} sm={6} md={6}>
            <BootstrapButton
              variant="light"
              className="w-100 py-2"
              style={buttonStyle("audit")}
              onMouseEnter={() => setHoveredButton("audit")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FaClipboardCheck style={{ color: "var(--bs-success)", marginRight: "8px" }} />
              <span className="d-none d-sm-inline">Content Audit</span>
              <span className="d-inline d-sm-none">Audit</span>
            </BootstrapButton>
          </Col>

          {/* Districts Button */}
          <Col xs={6} sm={6} md={6}>
            <BootstrapButton
              variant="light"
              className="w-100 py-2"
              style={buttonStyle("districts")}
              onMouseEnter={() => setHoveredButton("districts")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FaCity style={{ color: "#6f42c1", marginRight: "8px" }} />
              <span>Districts</span>
            </BootstrapButton>
          </Col>

          {/* Poll Data Button */}
          <Col xs={6} sm={6} md={6}>
            <BootstrapButton
              variant="light"
              className="w-100 py-2"
              style={buttonStyle("polls")}
              onMouseEnter={() => setHoveredButton("polls")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FaPoll style={{ color: "#17a2b8", marginRight: "8px" }} />
              <span className="d-none d-sm-inline">Poll Data</span>
              <span className="d-inline d-sm-none">Polls</span>
            </BootstrapButton>
          </Col>

          {/* Edit Forms Button */}
          <Col xs={6} sm={6} md={6}>
            <BootstrapButton
              variant="light"
              className="w-100 py-2"
              style={buttonStyle("forms")}
              onMouseEnter={() => setHoveredButton("forms")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FaFileSignature style={{ color: "#fd7e14", marginRight: "8px" }} />
              <span className="d-none d-sm-inline">Edit Forms</span>
              <span className="d-inline d-sm-none">Forms</span>
            </BootstrapButton>
          </Col>

          {/* Comment Management Button */}
          <Col xs={6} sm={6} md={6}>
            <BootstrapButton
              variant="light"
              className="w-100 py-2"
              style={buttonStyle("comments")}
              onMouseEnter={() => setHoveredButton("comments")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FaComments style={{ color: "#007bff", marginRight: "8px" }} />
              <span className="d-none d-sm-inline">Comments</span>
              <span className="d-inline d-sm-none">Comments</span>
            </BootstrapButton>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default QuickAdminActions;
