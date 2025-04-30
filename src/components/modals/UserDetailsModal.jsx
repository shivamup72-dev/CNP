import React from 'react';
import { Modal, Row, Col, Badge } from 'react-bootstrap';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield } from 'react-icons/fi';
import { formatDate } from '../../utils/DateUtility';

const UserDetailsModal = ({ show, onHide, user }) => {
  if (!user) return null;

  const closeModal = () => {
    if (typeof onHide === 'function') {
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={closeModal} size="lg" centered>
      <Modal.Header style={{ position: 'relative', borderBottom: 'none', padding: '0.8rem' }}>
        <Modal.Title>User Details</Modal.Title>
        <button
          type="button"
          className="btn-close"
          onClick={closeModal}
          style={{
            position: 'absolute', right: '1rem', top: '1.3rem', width: '24px', height: '24px',
            backgroundColor: '#000', borderRadius: '4px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', border: 'none', cursor: 'pointer', padding: 0, opacity: 1
          }}
        >
          <span style={{
            color: 'white', fontSize: '1.2rem', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', height: '100%'
          }}>×</span>
        </button>
      </Modal.Header>
      <Modal.Body>
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
            <h4 className="mb-3">{user.name}</h4>
            <div className="d-flex align-items-center mb-2">
              <FiMail className="me-2" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="d-flex align-items-center mb-2">
                <FiPhone className="me-2" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="d-flex align-items-center mb-2">
              <FiMapPin className="me-2" />
              <span>{user.location}</span>
            </div>
            {user.dob && (
              <div className="d-flex align-items-center mb-2">
                <FiCalendar className="me-2" />
                <span>{formatDate(user.dob)}</span>
              </div>
            )}
            <div className="d-flex align-items-center">
              <FiShield className="me-2" />
              <Badge bg="primary" className="text-capitalize">
                {user.role}
              </Badge>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default UserDetailsModal; 