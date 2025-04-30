import React from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import { formatDate } from '../../utils/DateUtility';
import { capitalizeWords } from '../../utils/Utility';
import { FiUser } from 'react-icons/fi';

const UserDetailsModal = ({ show, onHide, user }) => {
  if (!user) return null;

  // Role badge color mapping
  const getRoleBadgeColor = (role) => {
    if (!role) return "light"; // Light gray for regular users without roles
    
    switch (role) {
      case "ground_zero": 
      case "ground_zero_reporter": 
        return "custom-ground-zero"; // Custom color for ground zero reporters
      case "city_manager": return "info";
      case "state_manager": return "primary";
      case "national_manager": return "warning";
      case "god_admin": return "danger";
      default: return "secondary";
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="custom-modal">
      <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '0.7rem' }}>
        <Modal.Title style={{ fontSize: '1.1rem' }}>User Details</Modal.Title>
        <button
          type="button"
          className="btn-close"
          onClick={onHide}
          style={{
            position: 'absolute', right: '1rem', top: '1rem', width: '20px', height: '20px',
            backgroundColor: '#000', borderRadius: '4px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', border: 'none', cursor: 'pointer', padding: 0, opacity: 1
          }}>
          <span style={{ color: '#fff', fontSize: '1rem', lineHeight: 1 }}>×</span>
        </button>
      </Modal.Header>

      <Modal.Body style={{ padding: '1rem' }}>
        <Row className="mb-4">
          <Col md={3} className="text-center">
            <div
              className="rounded-circle overflow-hidden mx-auto"
              style={{
                width: "120px",
                height: "120px",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundImage: user.picture ? `url(${user.picture})` : "none",
                backgroundColor: user.picture ? "transparent" : "#e9ecef",
                border: "1px solid #dee2e6",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
            >
              {!user.picture && (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <FiUser size={48} color="#6c757d" />
                </div>
              )}
            </div>
          </Col>
          <Col md={9}>
            <h4 className="mb-3">{capitalizeWords(user.name)}</h4>
            <div className="d-flex align-items-center mb-2">
              <span 
                className={`badge me-2 ${getRoleBadgeColor(user.role) === 'custom-ground-zero' ? 'custom-ground-zero' : `bg-${getRoleBadgeColor(user.role)}`}`}
                style={getRoleBadgeColor(user.role) === 'custom-ground-zero' ? {
                  backgroundColor: '#9370DB', // Medium purple color
                  color: '#fff'
                } : {}}
              >
                {!user.role || user.role === "user" ? "Regular User" : capitalizeWords(user.role.replace('_', ' '))}
              </span>
              <span className={`badge bg-${user.status === 'active' ? 'success' : 'danger'}`}>
                {capitalizeWords(user.status)}
              </span>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Username:</strong> {user.username}
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong>Email:</strong> {user.email}
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Phone:</strong> {user.phone}
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong>Gender:</strong> {user.gender}
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Date of Birth:</strong> {user.dob ? formatDate(user.dob) : 'N/A'}
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong>Location:</strong> {user.location}
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Last Active:</strong> {user.lastActive ? formatDate(user.lastActive) : 'N/A'}
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default UserDetailsModal; 