import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, Form, Card } from 'react-bootstrap';
import { FiEdit, FiFlag, FiTrash, FiCheck } from 'react-icons/fi';
import { formatDate } from '../../utils/DateUtility';
import API from '../../api/endpoint';

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

  // Log modal content when it opens
  useEffect(() => {
    if (show && selectedPost) {
      console.log('======= PostDetailModal Content =======');
      console.log('Selected Post:', selectedPost);
      
      // Log more detailed information
      console.log('Post ID:', selectedPost.id);
      console.log('Title:', selectedPost.title);
      console.log('Content:', selectedPost.content);
      console.log('Author:', selectedPost.author);
      console.log('Date Created:', selectedPost.date_created);
      console.log('Post Status:', selectedPost.post_status);
      
      // Log media information
      console.log('Image URL:', selectedPost.image);
      if (selectedPost.allMedia) {
        console.log('All Media Files:', selectedPost.allMedia);
      }
      
      // Log flags and other status information
      console.log('Is Flagged:', selectedPost.flagged);
      console.log('Is Deleted:', selectedPost.isDeleted);
      if (selectedPost.flagReason) {
        console.log('Flag Reason:', selectedPost.flagReason);
        console.log('Flag Comment:', selectedPost.flagComment);
      }
      
      console.log('Is Edit Mode:', isEditMode);
      console.log('Edited Post:', editedPost);
      console.log('Is Admin Post:', isAdminPost(selectedPost));
      console.log('=====================================');
    }
  }, [show, selectedPost, isEditMode, editedPost, isAdminPost]);

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
      {selectedPost.post_status === "approved" ? (
        <Badge bg="success" className="ms-2" style={{ fontSize: "0.7rem" }}>
          Approved
        </Badge>
      ) : selectedPost.post_status === "flagged" || selectedPost.flagged ? (
        <Badge bg="" className="ms-2" style={{ fontSize: "0.7rem", backgroundColor: "#fd7e14" }}>
          Flagged
        </Badge>
      ) : selectedPost.post_status === "rejected" || selectedPost.isDeleted ? (
        <Badge bg="danger" className="ms-2" style={{ fontSize: "0.7rem" }}>
          Deleted
        </Badge>
      ) : (
        <Badge bg="warning" className="ms-2" style={{ fontSize: "0.7rem" }}>
          Pending
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
              {/* Display media files based on count */}
              {selectedPost.allMedia && selectedPost.allMedia.length > 0 ? (
                <div className="mb-3">
                  {selectedPost.allMedia.length === 1 ? (
                    // Single media - display larger and centered
                    <div className="text-center">
                      <img
                        src={typeof selectedPost.allMedia[0] === 'object' && selectedPost.allMedia[0].media 
                          ? API.getImageUrl(selectedPost.allMedia[0].media) 
                          : typeof selectedPost.allMedia[0] === 'string' 
                            ? selectedPost.allMedia[0] 
                            : "https://via.placeholder.com/400x300?text=Image+Unavailable"}
                        alt={selectedPost.title || ""}
                        style={{ 
                          maxWidth: "90%", 
                          maxHeight: "280px", 
                          objectFit: "contain", 
                          borderRadius: "4px",
                          cursor: "pointer" 
                        }}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Image+Unavailable"; }}
                        onClick={() => window.open(typeof selectedPost.allMedia[0] === 'object' && selectedPost.allMedia[0].media 
                          ? API.getImageUrl(selectedPost.allMedia[0].media) 
                          : typeof selectedPost.allMedia[0] === 'string' 
                            ? selectedPost.allMedia[0] 
                            : null, '_blank')}
                      />
                    </div>
                  ) : (
                    // Multiple media - display as gallery
                    <>
                      <p className="small text-muted mb-2">Media Files ({selectedPost.allMedia.length}):</p>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedPost.allMedia.map((media, index) => (
                          <div key={index} className="border rounded p-1" style={{ width: '100px' }}>
                            <img
                              src={typeof media === 'object' && media.media 
                                ? API.getImageUrl(media.media) 
                                : typeof media === 'string' 
                                  ? media 
                                  : "https://via.placeholder.com/100x100?text=File"}
                              alt={`Media ${index}`}
                              style={{ 
                                cursor: 'pointer', 
                                width: '100%', 
                                height: '80px', 
                                objectFit: 'cover', 
                                borderRadius: '4px' 
                              }}
                              onError={(e) => { e.target.src = "https://via.placeholder.com/100x100?text=Media"; }}
                              onClick={() => window.open(typeof media === 'object' && media.media 
                                ? API.getImageUrl(media.media) 
                                : typeof media === 'string' 
                                  ? media 
                                  : null, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : selectedPost.image && !selectedPost.image.includes('placeholder') ? (
                <div className="mb-3 text-center">
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.title || ""}
                    style={{ 
                      maxWidth: "90%", 
                      maxHeight: "280px", 
                      objectFit: "contain", 
                      borderRadius: "4px",
                      cursor: "pointer" 
                    }}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Image+Unavailable"; }}
                    onClick={() => window.open(selectedPost.image, '_blank')}
                  />
                </div>
              ) : null}

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
                        Published on {formatDate(selectedPost.date_created)}
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
