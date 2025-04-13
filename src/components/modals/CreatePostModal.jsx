import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const CreatePostModal = ({
  show = false,
  onHide = () => { },
  newPost = {},
  handleNewPostChange = () => { },
  handleImageUpload = () => { },
  handleCreatePost = () => { },
  validateForm = () => true,
  formErrors = {}
}) => {
  const [isButtonActive, setIsButtonActive] = useState(false);

  const categories = [
    "News", "Announcements", "Events", "Education", "Health", "Politics", "Technology",
    "Environment", "Sports", "Entertainment", "Business", "Community", "Social Issues", "Other"
  ];

  const handleCreateWithEffect = () => {
    setIsButtonActive(true);
    handleCreatePost();
    setTimeout(() => setIsButtonActive(false), 300);
  };

  const renderInput = (label, name, type = 'text') => (
    <div className="mb-2">
      <label className="form-label small mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={newPost[name] || ""}
        onChange={handleNewPostChange}
        className={`form-control form-control-sm ${formErrors[name] ? 'is-invalid' : ''}`}
        style={{ height: "35px" }}
      />
      {formErrors[name] && <div className="invalid-feedback small">{formErrors[name]}</div>}
    </div>
  );

  if (!show) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="md" className="custom-modal">
      <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '0.7rem' }}>
        <Modal.Title style={{ fontSize: '1.1rem' }}>Create New Post</Modal.Title>
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

      <Modal.Body style={{ padding: '0.8rem' }}>
        {renderInput("Title", "title")}
        <div className="mb-2">
          <label className="form-label small mb-1">Content</label>
          <textarea
            name="content"
            rows={4}
            value={newPost.content || ""}
            onChange={handleNewPostChange}
            className={`form-control form-control-sm ${formErrors.content ? 'is-invalid' : ''}`}
          />
          {formErrors.content && <div className="invalid-feedback small">{formErrors.content}</div>}
        </div>

        <div className="row mb-2">
          <div className="col-6">{renderInput("Author", "author")}</div>
          <div className="col-6">
            <label className="form-label small mb-1">Category</label>
            <select
              name="category"
              value={newPost.category || ""}
              onChange={handleNewPostChange}
              className={`form-select form-select-sm ${formErrors.category ? 'is-invalid' : ''}`}
              style={{ height: "35px" }}
            >
              <option value="">Select a category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {formErrors.category && <div className="invalid-feedback small">{formErrors.category}</div>}
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label small mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className={`form-control form-control-sm ${formErrors.image ? 'is-invalid' : ''}`}
            style={{ height: "35px" }}
          />
          {formErrors.image && <div className="invalid-feedback small">{formErrors.image}</div>}
          {newPost?.imagePreview && (
            <div className="mt-2 text-center">
              <img
                src={newPost.imagePreview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '6px' }}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x300?text=Image+Unavailable"; }}
              />
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer style={{ padding: '0.5rem 0.8rem' }}>
        <Button variant="secondary" onClick={onHide} size="sm" style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleCreateWithEffect}
          size="sm"
          className={isButtonActive ? 'pulse-effect' : ''}
          style={{
            backgroundColor: isButtonActive ? '#333' : '#000',
            borderColor: '#000',
            boxShadow: isButtonActive ? '0 0 8px rgba(0, 0, 0, 0.5)' : 'none',
            transform: isButtonActive ? 'scale(0.98)' : 'scale(1)',
            transition: 'all 0.2s ease'
          }}
        >
          Create Post
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreatePostModal;
