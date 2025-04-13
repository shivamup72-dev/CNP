import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const FlagModal = ({
  show = false,
  onHide = () => { },
  selectedPost = null,
  flagReason = "Hate speech or discrimination",
  setFlagReason = () => { },
  flagComment = "",
  setFlagComment = () => { },
  confirmFlag = () => { },
  canConfirmAction = () => true
}) => {
  const handleClose = () => {
    onHide();
    setFlagComment('');
    setFlagReason('Hate speech or discrimination');
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" className="custom-modal">
      <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '0.8rem' }}>
        <Modal.Title>⚠️ Warning: Inappropriate Content</Modal.Title>
        <button
          type="button"
          className="btn-close"
          onClick={handleClose}
          style={{
            position: 'absolute', right: '1rem', top: '1.3rem',
            width: 24, height: 24, backgroundColor: '#000',
            borderRadius: 4, display: 'flex', alignItems: 'center',
            justifyContent: 'center', border: 'none', cursor: 'pointer'
          }}
        >
          <span style={{ color: '#fff', fontSize: '1.2rem' }}>×</span>
        </button>
      </Modal.Header>

      <Modal.Body>
        <p>The post you are flagging contains content that violates our community guidelines.</p>
        <p>If the user continues, their account may be suspended or banned.</p>

        {selectedPost && (
          <div className="p-3 bg-light rounded mb-3">
            <h6 className="fw-bold mb-3">{selectedPost.title || "Untitled Post"}</h6>
            <div className="d-flex mb-2">
              {selectedPost.authorImage ? (
                <img src={selectedPost.authorImage} alt={selectedPost.author} className="rounded-circle me-2" style={{ width: 32, height: 32, objectFit: 'cover' }} />
              ) : (
                <div className="rounded-circle me-2 d-flex align-items-center justify-content-center bg-secondary text-white" style={{ width: 32, height: 32 }}>
                  {selectedPost.author?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <p className="mb-0 fw-bold">{selectedPost.author || "Unknown"}</p>
                <p className="text-muted small mb-0">{new Date(selectedPost.date_created || Date.now()).toLocaleString()}</p>
              </div>
            </div>
            {selectedPost.image && (
              <div className="mb-3">
                <img src={selectedPost.image} alt="Post" className="img-fluid rounded" style={{ maxHeight: 200, objectFit: 'contain' }} />
              </div>
            )}
            <p className="text-muted mb-3 small" style={{ whiteSpace: "pre-wrap" }}>{selectedPost.content || "No content"}</p>
            <div className="d-flex flex-wrap gap-2 small">
              <span className={`badge ${selectedPost.isApproved ? 'bg-success' : 'bg-warning text-dark'}`}>
                {selectedPost.isApproved ? "Approved" : "Pending"}
              </span>
              {selectedPost.flagged && <span className="badge bg-danger">Flagged</span>}
              <span className="badge bg-secondary">ID: {selectedPost.id}</span>
            </div>
          </div>
        )}

        <p>Please select a reason for flagging this content:</p>
        <select className="form-select mb-3" value={flagReason} onChange={(e) => setFlagReason(e.target.value)}>
          <option>Hate speech or discrimination</option>
          <option>Violence or threatening content</option>
          <option>Harassment or bullying</option>
          <option>Misinformation</option>
          <option>Other (please specify)</option>
        </select>

        <div className="mb-3">
          <label className="form-label">
            Comment (required) <span style={{ color: '#dc3545', fontWeight: 'bold' }}>*</span>
          </label>
          <textarea
            className="form-control"
            rows={3}
            value={flagComment}
            onChange={(e) => setFlagComment(e.target.value)}
            placeholder="Please explain why you are flagging this post..."
          />
          <small className="text-muted">Your explanation helps our team understand the context of the flag.</small>
        </div>

        <p className="text-danger">This action will be logged and reviewed by admins.</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} style={{ backgroundColor: '#000', borderColor: '#000' }}>
          Cancel
        </Button>
        <Button variant="danger" onClick={confirmFlag} disabled={!canConfirmAction(flagReason, flagComment)}>
          Confirm Flag
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FlagModal;
