import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FiRefreshCw } from 'react-icons/fi';

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
    >
      <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '0.8rem' }}>
        <Modal.Title>Restore Post</Modal.Title>
        <button
          type="button"
          className="btn-close"
          onClick={handleClose}
          style={{
            position: 'absolute',
            right: '1rem',
            top: '1.3rem',
            width: '24px',
            height: '24px',
            backgroundColor: '#000',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid red',
            cursor: 'pointer',
            opacity: 1.0
          }}
        >
          <span style={{ color: 'white', fontSize: '1.2rem' }}>×</span>
        </button>
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
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={onConfirmRestore}
          className="d-flex align-items-center"
        >
          <FiRefreshCw className="me-2" /> Restore Post
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RestorePostModal; 