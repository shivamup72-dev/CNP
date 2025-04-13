import React from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { FiEdit, FiFlag, FiTrash, FiCheck } from 'react-icons/fi';

const PostDetailModal = ({
  show = false,
  onHide = () => { },
  selectedPost = null,
  isEditMode = false,
  setIsEditMode = () => { },
  editedPost = null,
  handleEditChange = () => { },
  saveEditedPost = () => { },
  cancelEditing = () => { },
  enableEditMode = () => { },
  isAdminPost = () => false
}) => {
  if (!selectedPost && show && !isEditMode) return null;

  const closeModal = () => {
    onHide();
    setIsEditMode(false);
  };

  const renderAuthorAvatar = () => {
    if (selectedPost.authorImage) {
      return (
        <img
          src={selectedPost.authorImage}
          alt={selectedPost.author || ''}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      );
    }
    return <span style={{ fontSize: "16px", color: "#6c757d" }}>{selectedPost.author?.[0]?.toUpperCase() || "U"}</span>;
  };

  const renderUserTypeBadge = () => (
    <Badge bg="secondary" className="ms-2 px-2 py-1" style={{ fontSize: "0.7rem" }}>
      {isAdminPost(selectedPost) ? "admin" : "user"}
    </Badge>
  );

  const renderStatusBadges = () => (
    <>
      <Badge bg={selectedPost.isApproved ? "success" : "warning"} className="ms-2" style={{ fontSize: "0.7rem" }}>
        {selectedPost.isApproved ? "Approved" : "Pending"}
      </Badge>
      {selectedPost.flagged && (
        <Badge bg="danger" className="ms-1" style={{ fontSize: "0.7rem" }}>
          Flagged
        </Badge>
      )}
    </>
  );

  return (
    <Modal
      show={show}
      onHide={closeModal}
      centered
      size="lg"
      className="custom-modal"
    >
      <Modal.Header style={{ position: 'relative', borderBottom: 'none', padding: '0.8rem' }}>
        <Modal.Title>{isEditMode ? "Edit Post" : "Post Details"}</Modal.Title>
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

      <Modal.Body style={{ padding: '1rem' }}>
        {isEditMode ? (
          <>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={editedPost?.title || ""}
                onChange={handleEditChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Content</label>
              <textarea
                className="form-control"
                rows={6}
                name="content"
                value={editedPost?.content || ""}
                onChange={handleEditChange}
              />
            </div>
          </>
        ) : (
          selectedPost && (
            <>
              {selectedPost.image && (
                <div className="mb-3 text-center">
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.title || ""}
                    style={{ maxWidth: "100%", maxHeight: "250px", objectFit: "contain", borderRadius: "4px" }}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Image+Unavailable"; }}
                  />
                </div>
              )}

              <h4 className="mb-3">{selectedPost.title || "No Title"}</h4>
              <p className="mb-4" style={{ whiteSpace: "pre-wrap" }}>{selectedPost.content || "No content available."}</p>

              <div className="d-flex justify-content-between align-items-start mt-4 pt-3">
                <div className="d-flex">
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e9ecef",
                    display: "flex", alignItems: "center", justifyContent: "center", marginRight: "10px", overflow: "hidden"
                  }}>
                    {renderAuthorAvatar()}
                  </div>
                  <div>
                    <div className="d-flex align-items-center">
                      <span style={{ fontSize: "12px", color: "#6c757d" }}>
                        Posted by {selectedPost.author || "Unknown"}
                      </span>
                      {renderUserTypeBadge()}
                    </div>
                    <div className="d-flex align-items-center mt-1">
                      <span style={{ fontSize: "12px", color: "#6c757d" }}>
                        Published on {new Date(selectedPost.date_created || Date.now()).toLocaleDateString()}
                      </span>
                      {renderStatusBadges()}
                    </div>
                  </div>
                </div>
                <div>
                  <Button variant="outline-success" size="sm" className="me-1" title="Approve"><FiCheck /></Button>
                  <Button variant="outline-warning" size="sm" className="me-1" title="Flag"><FiFlag /></Button>
                  <Button variant="outline-danger" size="sm" className="me-1" title="Delete"><FiTrash /></Button>
                  {isAdminPost(selectedPost) && (
                    <Button variant="outline-dark" size="sm" onClick={enableEditMode} title="Edit"><FiEdit /></Button>
                  )}
                </div>
              </div>
            </>
          )
        )}
      </Modal.Body>

      <Modal.Footer style={{ borderTop: 'none' }}>
        {isEditMode ? (
          <>
            <Button variant="secondary" onClick={cancelEditing}>Cancel</Button>
            <Button variant="primary" onClick={saveEditedPost} style={{ backgroundColor: '#000', borderColor: '#000' }}>Save Changes</Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onHide} style={{ backgroundColor: '#000', borderColor: '#000' }}>Close</Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PostDetailModal;
