import React from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import { formatDate } from '../../utils/DateUtility';
import { capitalizeWords } from '../../utils/Utility';

const VoterCardDetailsModal = ({ show, onHide, voterCard }) => {
  if (!voterCard) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="custom-modal">
      <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '0.7rem' }}>
        <Modal.Title style={{ fontSize: '1.1rem' }}>Voter Card Details</Modal.Title>
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
        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Full Name:</strong>
              <div>{capitalizeWords(voterCard.full_name)}</div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong>Guardian Name:</strong>
              <div>{capitalizeWords(voterCard.guardian_name)}</div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Gender:</strong>
              <div>{voterCard.gender}</div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong>Date of Birth:</strong>
              <div>{voterCard.date_of_birth ? formatDate(voterCard.date_of_birth) : 'N/A'}</div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Mobile Number:</strong>
              <div>{voterCard.mobile_number || 'N/A'}</div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong>Email ID:</strong>
              <div>{voterCard.email_id || 'N/A'}</div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>State:</strong>
              <div>{voterCard.state?.name || 'N/A'}</div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong>City:</strong>
              <div>{voterCard.city?.profile_id || 'N/A'}</div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Address:</strong>
              <div>{voterCard.address || 'N/A'}</div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong>PIN Code:</strong>
              <div>{voterCard.pin_code || 'N/A'}</div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Status:</strong>
              <div>
                <span className={`badge bg-${voterCard.approval_status === 'pending' ? 'warning' : 'success'}`}>
                  {capitalizeWords(voterCard.approval_status)}
                </span>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong>Created By:</strong>
              <div>{voterCard.created_by?.full_name || 'N/A'}</div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong>Request Date:</strong>
              <div>{voterCard.date_created ? formatDate(voterCard.date_created) : 'N/A'}</div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong>Last Updated:</strong>
              <div>{voterCard.date_updated ? formatDate(voterCard.date_updated) : 'N/A'}</div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <div className="mb-2">
              <strong>Age Proof:</strong>
              <div>
                {voterCard.age_proof ? (
                  <a href={voterCard.age_proof} target="_blank" rel="noopener noreferrer" className="text-primary">
                    View Document
                  </a>
                ) : 'N/A'}
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="mb-2">
              <strong>Address Proof:</strong>
              <div>
                {voterCard.address_proof ? (
                  <a href={voterCard.address_proof} target="_blank" rel="noopener noreferrer" className="text-primary">
                    View Document
                  </a>
                ) : 'N/A'}
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="mb-2">
              <strong>Identity Proof:</strong>
              <div>
                {voterCard.identity_proof ? (
                  <a href={voterCard.identity_proof} target="_blank" rel="noopener noreferrer" className="text-primary">
                    View Document
                  </a>
                ) : 'N/A'}
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default VoterCardDetailsModal; 