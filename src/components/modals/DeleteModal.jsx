import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteModal = ({
  show = false,
  onHide,
  selectedPost,
  deleteReason = "Hate speech or discrimination",
  setDeleteReason,
  deleteComment = "",
  setDeleteComment,
  onConfirmDelete,
  canConfirmAction = () => true,
}) => {
  if (!show) return null;

  const handleClose = () => {
    onHide?.();
    setDeleteComment?.('');
    setDeleteReason?.('Hate speech or discrimination');
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" className="custom-modal">
      <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '0.8rem' }}>
        <Modal.Title>⚠️ Confirm Deletion</Modal.Title>
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
        <p>Are you sure you want to delete this post?</p>

        {selectedPost && (
          <div className="p-3 bg-light rounded mb-3">
            <h6 className="fw-bold mb-3">{selectedPost.title || "Untitled Post"}</h6>

            <div className="d-flex mb-2">
              {selectedPost.authorImage ? (
                <img
                  src={selectedPost.authorImage}
                  alt={selectedPost.author || "Unknown"}
                  className="rounded-circle me-2"
                  style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="rounded-circle me-2 d-flex align-items-center justify-content-center bg-secondary text-white"
                  style={{ width: '32px', height: '32px' }}
                >
                  {selectedPost.author?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <p className="mb-0 fw-bold">{selectedPost.author || "Unknown"}</p>
                <p className="text-muted small mb-0">
                  {new Date(selectedPost.date_created || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>

            {selectedPost.image && (
              <img
                src={selectedPost.image}
                alt={selectedPost.title || "Post image"}
                className="img-fluid rounded mb-3"
                style={{ maxHeight: '200px', objectFit: 'contain' }}
              />
            )}

            <p className="text-muted mb-3 small" style={{ whiteSpace: "pre-wrap" }}>
              {selectedPost.content || "No content"}
            </p>

            <div className="d-flex flex-wrap gap-2 small">
              <span className={`badge ${selectedPost.isApproved ? 'bg-success' : 'bg-warning text-dark'}`}>
                {selectedPost.isApproved ? "Approved" : "Pending"}
              </span>
              {selectedPost.flagged && <span className="badge bg-danger">Flagged</span>}
              <span className="badge bg-secondary">ID: {selectedPost.id}</span>
            </div>
          </div>
        )}

        <p>Please select a reason for deleting this post:</p>
        <select
          className="form-select mb-3"
          value={deleteReason}
          onChange={(e) => setDeleteReason?.(e.target.value)}
        >
          <option>Hate speech or discrimination</option>
          <option>Violence or threatening content</option>
          <option>Harassment or bullying</option>
          <option>Misinformation</option>
          <option>Other (please specify)</option>
        </select>

        <div className="mb-3">
          <label className="form-label">
            Comment (required) <span className="text-danger fw-bold">*</span>
          </label>
          <textarea
            className="form-control"
            rows={3}
            value={deleteComment}
            onChange={(e) => setDeleteComment?.(e.target.value)}
            placeholder="Please explain why you are deleting this post..."
          />
          <small className="text-muted">Your explanation helps us maintain quality standards.</small>
        </div>

        <p className="text-danger">This action cannot be undone.</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} style={{ backgroundColor: '#000', borderColor: '#000' }}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirmDelete} disabled={!canConfirmAction(deleteReason, deleteComment)}>
          Delete Permanently
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
