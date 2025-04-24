import React, { useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import API from '../../api/endpoint';
import { showSuccessToast, showErrorToast } from '../common/Toast.jsx';
import { FiX } from 'react-icons/fi';

const CreatePostModal = ({
  show = false,
  onHide = () => { },
  newPost = {},
  handleNewPostChange = () => { },
  handleImageUpload = () => { },
  handleCreatePost = () => { },
  validateForm = () => {
    let valid = true;
    const errors = {};

    if (!newPost.content?.trim()) {
      errors.content = "Content is required";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  },
  formErrors = {},
  setFormErrors = () => { },
  setPosts = () => { }
}) => {
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  const handleMediaFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Store the actual file objects
    setMediaFiles(prevFiles => [...prevFiles, ...files]);

    // Create previews for images
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreviews(prev => [...prev, {
            file: file,
            preview: reader.result,
            type: 'image'
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files (like PDF), just show a placeholder
        setMediaPreviews(prev => [...prev, {
          file: file,
          preview: null,
          type: 'file',
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB'
        }]);
      }
    });

    // Clear the input value to allow selecting the same file again
    e.target.value = null;
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setMediaPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  const createPost = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setApiErrors(null);
    
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Add description (content)
      formData.append('description', newPost.content);
      
      // Add media files if they exist
      if (mediaFiles.length > 0) {
        mediaFiles.forEach((file, index) => {
          formData.append(`media[${index}]`, file);
        });
      }
      
      console.log('[CREATE POST] Submitting post to API with', mediaFiles.length, 'media files');
      
      // Make API call
      const response = await API.post('/api/v1/web/create-post/', formData, {
        headers: {}  // Let browser set content-type for FormData
      });
      
      console.log('[CREATE POST] API response:', response);
      
      // Format the new post for our UI
      const createdPost = {
        id: response.id.toString(),
        title: response.description || "No title",
        content: response.description || "No content",
        author: response.created_by?.full_name || "Anonymous",
        authorId: response.created_by?.user_id,
        category: "Other",
        image: response.media_files && response.media_files.length > 0 
          ? API.getImageUrl(response.media_files[0].media) 
          : mediaPreviews[0]?.preview || null,
        allMedia: response.media_files || [],
        date: new Date().toISOString(),
        post_status: response.status === "publish" ? "approved" : "pending",
        isReposted: false,
        // Keep track of author details
        authorImage: response.created_by?.picture ? API.getImageUrl(response.created_by.picture) : null,
        created_by: response.created_by
      };
      
      // Update the posts state
      if (setPosts) {
        setPosts(prevPosts => [createdPost, ...prevPosts]);
      }
      
      // Show success message
      showSuccessToast('Post created successfully!');
      
      // Close modal and reset form
      setTimeout(() => {
        onHide();
        // Reset state
        setMediaFiles([]);
        setMediaPreviews([]);
      }, 500);
    } catch (error) {
      console.error('[CREATE POST] Error:', error);
      
      // Extract the actual error object, which could be in error.response or directly in error
      const errorData = error.response || error;
      
      // Handle API error
      if (errorData.media && errorData.media['0']) {
        // Media file error
        setApiErrors({
          media: errorData.media['0'][0]
        });
        showErrorToast(errorData.media['0'][0]);
      } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
        // Extract first error message from any field
        const firstErrorField = Object.keys(errorData)[0];
        let errorMessage = 'Unknown error occurred';
        
        if (Array.isArray(errorData[firstErrorField])) {
          errorMessage = errorData[firstErrorField][0];
        } else if (typeof errorData[firstErrorField] === 'string') {
          errorMessage = errorData[firstErrorField];
        }
        
        setApiErrors({
          [firstErrorField]: errorMessage,
          general: `Error: ${errorMessage}`
        });
        showErrorToast(errorMessage);
      } else {
        // Generic error
        setApiErrors({
          general: 'Failed to create post. Please check your connection and try again.'
        });
        showErrorToast('Failed to create post. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
      setIsButtonActive(false);
    }
  };

  const handleCreateWithEffect = () => {
    setIsButtonActive(true);
    createPost();
  };

  const resetForm = () => {
    setMediaFiles([]);
    setMediaPreviews([]);
    onHide();
  };

  if (!show) return null;

  return (
    <Modal show={show} onHide={resetForm} centered size="md" className="custom-modal">
      <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '0.7rem' }}>
        <Modal.Title style={{ fontSize: '1.1rem' }}>Create New Post</Modal.Title>
        <button
          type="button"
          className="btn-close"
          onClick={resetForm}
          style={{
            position: 'absolute', right: '1rem', top: '1rem', width: '20px', height: '20px',
            backgroundColor: '#000', borderRadius: '4px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', border: 'none', cursor: 'pointer', padding: 0, opacity: 1
          }}>
          <span style={{ color: '#fff', fontSize: '1rem', lineHeight: 1 }}>×</span>
        </button>
      </Modal.Header>

      <Modal.Body style={{ padding: '0.8rem' }}>
        {apiErrors?.general && (
          <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '0.9rem' }}>
            {apiErrors.general}
          </div>
        )}
      
        <div className="mb-3">
          <label className="form-label">Content</label>
          <textarea
            name="content"
            rows={6}
            value={newPost.content || ""}
            onChange={handleNewPostChange}
            className={`form-control ${formErrors.content ? 'is-invalid' : ''}`}
            placeholder="Enter your post content here..."
            disabled={isSubmitting}
          />
          {formErrors.content && <div className="invalid-feedback">{formErrors.content}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Media Files</label>
          <input
            type="file"
            accept="image/*,application/pdf,video/*"
            onChange={handleMediaFilesChange}
            className={`form-control ${formErrors.image || apiErrors?.media ? 'is-invalid' : ''}`}
            disabled={isSubmitting}
            multiple
          />
          {formErrors.image && <div className="invalid-feedback">{formErrors.image}</div>}
          {apiErrors?.media && <div className="invalid-feedback">{apiErrors.media}</div>}
          
          {mediaPreviews.length > 0 && (
            <div className="mt-3">
              <p className="small text-muted mb-2">Selected files ({mediaPreviews.length}):</p>
              <div className="d-flex flex-wrap gap-2">
                {mediaPreviews.map((item, index) => (
                  <div 
                    key={index} 
                    className="position-relative border rounded p-1" 
                    style={{ width: item.type === 'image' ? '100px' : '150px' }}
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.preview}
                        alt={`Preview ${index}`}
                        style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <div 
                        className="d-flex flex-column justify-content-center align-items-center bg-light p-2" 
                        style={{ height: '80px', borderRadius: '4px' }}
                      >
                        <i className="bi bi-file-earmark-text" style={{ fontSize: '1.5rem' }}></i>
                        <span className="small text-truncate w-100 text-center">{item.name}</span>
                        <span className="small text-muted">{item.size}</span>
                      </div>
                    )}
                    <button 
                      type="button"
                      className="position-absolute top-0 end-0 btn btn-sm btn-danger p-0 d-flex justify-content-center align-items-center"
                      style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                      onClick={() => removeMediaFile(index)}
                      disabled={isSubmitting}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer style={{ padding: '0.5rem 0.8rem' }}>
        <Button 
          variant="secondary" 
          onClick={resetForm} 
          size="sm" 
          style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}
          disabled={isSubmitting}
        >
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
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-1"
              />
              Creating...
            </>
          ) : 'Create Post'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreatePostModal;
