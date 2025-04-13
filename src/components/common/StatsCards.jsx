import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FiUsers, FiFileText, FiUserCheck } from "react-icons/fi";
import { FaPoll } from "react-icons/fa";

const StatsCards = ({ customStats }) => {
  // Default stats if not provided
  const defaultStats = [
    { title: "Total Users", value: "1,234", icon: <FiUsers className="stat-icon" />, color: "primary" },
    { title: "Total Posts", value: "456", icon: <FiFileText className="stat-icon" />, color: "success" },
    { title: "Active Users", value: "60%", icon: <FiUserCheck className="stat-icon" />, color: "warning" },
    { title: "Polling Turn Up", value: "75%", icon: <FaPoll className="stat-icon" />, color: "info" }
  ];

  // Use provided stats or default
  const statsCards = customStats || defaultStats;

  return (
    <Row className="g-3 mb-4">
      {statsCards.map((stat, index) => (
        <Col key={index} xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm bg-white quick-action-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="small mb-1 fw-bold" style={{ color: "grey" }}>{stat.title}</div>
                  <h3 className="fw-bold" style={{
                    color: stat.color === "success" ? "#198754" :
                      stat.color === "warning" ? "#ffc107" : "black"
                  }}>{stat.value}</h3>
                </div>
                {stat.icon}
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards; 