import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { formatDate } from '../../utils/DateUtility';
import API from '../../api/endpoint';

const FlagModal = ({
  show = false,
  onHide = () => { },
  selectedPost = null,
  flagReason = "",
  setFlagReason = () => { },
  flagReasonId = null,
  setFlagReasonId = () => { },
  flagComment = "",
  setFlagComment = () => { },
  confirmFlag = () => { },
  canConfirmAction = () => true
}) => {
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remarkRequired, setRemarkRequired] = useState(false);

  // Fetch reasons when modal shows
  useEffect(() => {
    if (show) {
      fetchReasons();
    }
  }, [show]);

  const fetchReasons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await API.getAdminChoices('post');
      setReasons(data);
      
      // Set default reason if reasons are loaded and current reason is empty
      if (data.length > 0 && !flagReason) {
        setFlagReason(data[0].name);
        setFlagReasonId(data[0].id);
        setRemarkRequired(data[0].is_remark_require);
      }
    } catch (err) {
      console.error('Error fetching flag reasons:', err);
      setError('Failed to load flag reasons');
    } finally {
      setLoading(false);
    }
  };

  // Update remark requirement when reason changes
  const handleReasonChange = (e) => {
    const selectedReasonName = e.target.value;
    setFlagReason(selectedReasonName);
    
    // Find the selected reason object to get ID and remark requirement
    const reasonObj = reasons.find(r => r.name === selectedReasonName);
    if (reasonObj) {
      setFlagReasonId(reasonObj.id);
      setRemarkRequired(reasonObj.is_remark_require);
    }
  };

  const handleClose = () => {
    onHide();
    setFlagComment('');
    if (reasons.length > 0) {
      setFlagReason(reasons[0].name);
      setFlagReasonId(reasons[0].id);
    } else {
      setFlagReason('');
      setFlagReasonId(null);
    }
  };

  const isFormValid = () => {
    // If remarks are required, comment must be provided
    if (remarkRequired && !flagComment.trim()) {
      return false;
    }
    return true;
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
                <p className="text-muted small mb-0">{formatDate(selectedPost.date_created || Date.now())}</p>
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

        {loading ? (
          <div className="text-center py-3">Loading reasons...</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <>
            <p>Please select a reason for flagging this content:</p>
            <select 
              className="form-select mb-3" 
              value={flagReason} 
              onChange={handleReasonChange}
              disabled={reasons.length === 0}
            >
              {reasons.length === 0 ? (
                <option>No reasons available</option>
              ) : (
                reasons.map(reason => (
                  <option key={reason.id} value={reason.name}>
                    {reason.name}
                  </option>
                ))
              )}
            </select>

            {remarkRequired && (
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
            )}
          </>
        )}

        <p className="text-danger">This action will be logged and reviewed by admins.</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} style={{ backgroundColor: '#000', borderColor: '#000' }}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={confirmFlag} 
          disabled={loading || reasons.length === 0 || !isFormValid()}
        >
          Confirm Flag
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FlagModal;
