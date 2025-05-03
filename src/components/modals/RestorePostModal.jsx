import React from 'react';
import { Modal } from 'react-bootstrap';
import { FiRefreshCw } from 'react-icons/fi';
import BootstrapButton from '../common/BootstrapButton';
import './RestorePostModal.css';

const RestorePostModal = ({
  show,
  onHide,
  selectedPost,
  onConfirmRestore
}) => {
  // Handle close function
  const handleClose = () => {
    // Call the parent component's onHide function
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="md"
      className="custom-modal"
    >
      <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '0.8rem' }}>
        <Modal.Title>Restore Post</Modal.Title>
        <BootstrapButton
          variant="dark"
          onClick={handleClose}
          className="btn-close-custom"
          style={{
            position: 'absolute',
            right: '1rem',
            top: '1rem',
            width: '30px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        >
          <span style={{ color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</span>
        </BootstrapButton>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to restore this deleted post and remove it from the deleted posts category?
        </p>
        {selectedPost && (
          <div className="bg-light p-3 rounded mb-3">
            <strong>Post Content:</strong>
            <p className="mb-0 mt-2 text-truncate">
              {selectedPost.title || selectedPost.content || "No content available"}
            </p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <BootstrapButton variant="secondary" onClick={handleClose}>
          Cancel
        </BootstrapButton>
        <BootstrapButton
          variant="success"
          onClick={onConfirmRestore}
          className="d-flex align-items-center"
        >
          <FiRefreshCw className="me-2" /> Restore Post
        </BootstrapButton>
      </Modal.Footer>
    </Modal>
  );
};

export default RestorePostModal; 