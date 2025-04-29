import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, Form, Card } from 'react-bootstrap';
import { FiEdit, FiFlag, FiTrash, FiCheck, FiPlus, FiX } from 'react-icons/fi';
import { formatDate } from '../../utils/DateUtility';
import API from '../../api/endpoint';
import { showSuccessToast } from '../../components/common/Toast.jsx';

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
  isAdminPost = () => false,
  setEditedPost = () => { }
}) => {
  if (!selectedPost && show && !isEditMode) return null;

  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [localEditedPost, setLocalEditedPost] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // New state for multiple files
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Handle multiple file selection for image upload
  const handleMultipleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      
      // Create preview URLs for the selected files
      const newPreviewUrls = [];
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviewUrls.push({
            file: file,
            url: reader.result,
            name: file.name,
            size: file.size
          });
          
          // Update state when all files are processed
          if (newPreviewUrls.length === files.length) {
            setPreviewUrls(newPreviewUrls);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle file selection for single image upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create a preview URL for the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        
        // Only update the current post object, not re-initialize everything
        if (localEditedPost) {
          setLocalEditedPost({
            ...localEditedPost,
            image: reader.result
          });
        }
        
        // Update parent editedPost if available
        if (editedPost && typeof setEditedPost === 'function') {
          setEditedPost({
            ...editedPost,
            image: reader.result
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload for multiple files
  const handleMultipleImageUpload = async () => {
    if (selectedFiles.length > 0) {
      try {
        // Prepare the form data
        const formData = new FormData();
        
        // Add the description/content
        const postToSave = editedPost || localEditedPost;
        formData.append('description', postToSave?.content || '');
        
        // Add multiple files
        selectedFiles.forEach((file, index) => {
          formData.append(`media_${index}`, file);
        });
        
        // Add a field to indicate this is a multiple file upload
        formData.append('multiple_files', 'true');
        
        // Get authentication token
        let token = null;
        try {
          const userDataStr = localStorage.getItem("userData");
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            token = userData.token || userData.accessToken || userData.access_token;
          }
          
          if (!token) {
            token = localStorage.getItem("token") || 
                   localStorage.getItem("accessToken") || 
                   localStorage.getItem("access_token") ||
                   sessionStorage.getItem("token");
          }
        } catch (error) {
          console.error("Error retrieving auth token:", error);
        }
        
        if (!token) {
          alert("Authentication error: Please log in again to edit posts.");
          return;
        }
        
        // Create auth header
        const authHeader = `Token ${token}`;
        
        // Make API call
        const response = await fetch(`https://stage.suniyenetajee.com/api/v1/web/edit-post/${postToSave.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': authHeader
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload images: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("Images uploaded successfully:", result);
        
        // Clear state and update UI
        setSelectedFiles([]);
        setPreviewUrls([]);
        
        // Show success message
        showSuccessToast("Images uploaded successfully!");
        
        // Close modal or update UI as needed
        closeModal();
        
      } catch (error) {
        console.error("Error uploading multiple images:", error);
        alert(`Error uploading images: ${error.message}`);
      }
    }
  };

  // Remove a file from the selection
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Handle individual image upload
  const handleImageUpload = () => {
    if (selectedFile && typeof saveEditedPost === 'function') {
      console.log("Uploading file:", selectedFile.name);
      // The image is already updated in editedPost via handleFileSelect
      saveEditedPost();
      setShowImageEditor(false);
      setSelectedFile(null);
      setPreviewUrl('');
    }
  };

  // Custom handler for edit changes to ensure we always have a valid editedPost
  const handleLocalEditChange = (e) => {
    const { name, value } = e.target;
    
    // Update local state
    if (localEditedPost) {
      setLocalEditedPost({
        ...localEditedPost,
        [name]: value
      });
    } else if (selectedPost) {
      // Initialize with selectedPost if localEditedPost doesn't exist
      setLocalEditedPost({
        ...selectedPost,
        [name]: value
      });
    }
    
    // Call the original handler if available
    if (typeof handleEditChange === 'function') {
      handleEditChange(e);
    }
  };

  // Combine the admin check to be more reliable
  const isUserAdmin = (post) => {
    if (!post) return false;
    
    // First check the passed isAdminPost function
    if (isAdminPost(post)) return true;
    
    // Fallback to direct check
    try {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        return userData.userId && post.authorId && userData.userId === post.authorId;
      }
    } catch (e) {
      console.error("Error checking admin status:", e);
    }
    
    return false;
  };

  // Initialize state once when the modal opens
  useEffect(() => {
    // Only initialize when the modal first shows and we haven't initialized yet
    if (show && selectedPost && !isInitialized) {
      console.log("Initializing post data from selectedPost (once)");
      
      // Make a deep copy to avoid reference issues
      const postCopy = JSON.parse(JSON.stringify(selectedPost));
      
      // Set local state
      setLocalEditedPost(postCopy);
      
      // Set parent state if available
      if (typeof setEditedPost === 'function') {
        setEditedPost(postCopy);
      }
      
      // Mark as initialized
      setIsInitialized(true);
    }
    
    // Reset initialization flag when modal closes
    if (!show) {
      setIsInitialized(false);
    }
  }, [show, selectedPost, isInitialized]);

  // Custom save function that uses localEditedPost as fallback
  const handleSafeEditSave = async () => {
    try {
      // Use local state if parent state is not available
      const postToSave = editedPost || localEditedPost;
      console.log("Attempting to save post with data:", postToSave);
      
      // Check if post exists
      if (!postToSave) {
        console.error("Cannot save: post data is null or undefined");
        // Just close modal without error alert when no edit data
        closeModal();
        return;
      }
      
      // If post ID is missing, try to get it from selectedPost
      if (!postToSave.id && selectedPost) {
        console.log("Post ID is missing, using selectedPost.id instead");
        postToSave.id = selectedPost.id;
      }
      
      if (!postToSave.id) {
        console.error("Cannot save: Post ID is missing");
        closeModal();
        return;
      }
      
      // Check if any changes were actually made
      let changes = false;
      
      // For content changes
      if (selectedPost && postToSave.content !== selectedPost.content) {
        changes = true;
      }
      
      // For image changes
      if (selectedFile || selectedFiles.length > 0) {
        changes = true;
      }
      
      // If no changes were made, just close the modal without making API call
      if (!changes) {
        console.log("No changes detected, closing modal without saving");
        closeModal();
        return;
      }
      
      // Ensure authorId is preserved from the selectedPost
      if (selectedPost && selectedPost.authorId && !postToSave.authorId) {
        console.log("Preserving authorId from original post");
        postToSave.authorId = selectedPost.authorId;
      }
      
      // Preserve other important metadata from the original post
      if (selectedPost) {
        // Preserve date information
        if (selectedPost.date && !postToSave.date) {
          postToSave.date = selectedPost.date;
        }
        if (selectedPost.date_created && !postToSave.date_created) {
          postToSave.date_created = selectedPost.date_created;
        }
        
        // Preserve status information
        if (selectedPost.post_status && !postToSave.post_status) {
          postToSave.post_status = selectedPost.post_status;
        }
        if (selectedPost.flagged !== undefined && postToSave.flagged === undefined) {
          postToSave.flagged = selectedPost.flagged;
        }
        if (selectedPost.isDeleted !== undefined && postToSave.isDeleted === undefined) {
          postToSave.isDeleted = selectedPost.isDeleted;
        }
        if (selectedPost.isApproved !== undefined && postToSave.isApproved === undefined) {
          postToSave.isApproved = selectedPost.isApproved;
        }
        
        // Preserve author information
        if (selectedPost.author && !postToSave.author) {
          postToSave.author = selectedPost.author;
        }
      }
      
      // Get the authentication token - handle all common patterns
      let token = null;
      try {
        // First try getting from userData
        const userDataStr = localStorage.getItem("userData");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          token = userData.token || userData.accessToken || userData.access_token;
          console.log("Found token in userData");
        }
        
        // If not found in userData, try other common keys
        if (!token) {
          token = localStorage.getItem("token") || 
                 localStorage.getItem("accessToken") || 
                 localStorage.getItem("access_token") ||
                 sessionStorage.getItem("token");
          
          if (token) console.log("Found token in direct storage");
        }
      } catch (error) {
        console.error("Error retrieving auth token:", error);
      }
      
      // If token still not found, show error
      if (!token) {
        console.error("Authentication token not found. Cannot proceed with edit.");
        alert("Authentication error: Please log in again to edit posts.");
        return;
      }
      
      console.log("Using token (first few chars):", token.substring(0, 10) + "...");
      
      // Create authorization header with 'Token' prefix instead of 'Bearer'
      // This is commonly used by Django REST Framework APIs
      const authHeader = `Token ${token}`;
      console.log("Authorization header format:", "Token [token...]");
      
      // Determine if we're uploading a file or just updating text content
      if (selectedFile) {
        // Use FormData for file uploads
        const formData = new FormData();
        // Make sure to use the correct field names that match the API's expectations
        formData.append('description', postToSave.content || ''); // Using description field name as specified
        formData.append('media', selectedFile);
        
        console.log("FormData fields:");
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + (pair[0] === 'media' ? 'File: ' + selectedFile.name : pair[1]));
        }
        
        // Make API call with FormData - using proper token format
        const response = await fetch(`https://stage.suniyenetajee.com/api/v1/web/edit-post/${postToSave.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': authHeader
            // NOTE: Do not set Content-Type header for FormData, browser will set it automatically with boundary
          },
          body: formData
        });
        
        // Check for any error status and get full error details
        if (!response.ok) {
          let errorMessage = `Status: ${response.status} ${response.statusText}`;
          try {
            // Try to parse error as JSON
            const errorData = await response.json();
            console.error("API Error Response (JSON):", errorData);
            
            // Format error message from response
            if (typeof errorData === 'object') {
              const errorDetails = Object.entries(errorData)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
              errorMessage += ` - ${errorDetails}`;
            }
            
            // Check for specific error about media field
            if (errorMessage.includes("media: Expected a list") && !selectedFile && !selectedFiles.length) {
              // This is the case when no changes were made, just close the modal
              console.log("Media format error but no files selected, silently closing");
              closeModal();
              return;
            }
          } catch (e) {
            // If not JSON, get as text
            const errorText = await response.text();
            console.error("API Error Response (Text):", errorText);
            if (errorText) {
              errorMessage += ` - ${errorText}`;
            }
          }
          throw new Error(`Failed to update post: ${errorMessage}`);
        }
        
        const result = await response.json();
        console.log("Post updated successfully with new image:", result);
        
        // Ensure important metadata is preserved in the response
        if (result && selectedPost) {
          // Preserve authorId for role display
          if (!result.authorId && selectedPost.authorId) {
            result.authorId = selectedPost.authorId;
          }
          
          // Preserve dates for display
          if (!result.date && selectedPost.date) {
            result.date = selectedPost.date;
          }
          if (!result.date_created && selectedPost.date_created) {
            result.date_created = selectedPost.date_created;
          }
          
          // Preserve status information
          if (!result.post_status && selectedPost.post_status) {
            result.post_status = selectedPost.post_status;
          }
          if (result.flagged === undefined && selectedPost.flagged !== undefined) {
            result.flagged = selectedPost.flagged;
          }
          if (result.isDeleted === undefined && selectedPost.isDeleted !== undefined) {
            result.isDeleted = selectedPost.isDeleted;
          }
          if (result.isApproved === undefined && selectedPost.isApproved !== undefined) {
            result.isApproved = selectedPost.isApproved;
          }
          
          // Preserve author information
          if (!result.author && selectedPost.author) {
            result.author = selectedPost.author;
          }
        }
        
        // Use the result data with preserved metadata for the final updated post
        const finalUpdatedPost = { ...result, ...postToSave };
        
        // Clear the selected file after successful upload
        setSelectedFile(null);
        setPreviewUrl('');
        
        // Close the modal directly instead of waiting
        closeModal();
        
        // Show a success toast message
        showSuccessToast("Post updated successfully!");
        
        // Don't call any other callback that might trigger other modals
        // If needed, pass a flag to the parent component to refresh data
        if (typeof saveEditedPost === 'function') {
          try {
            // Call with the post that has all metadata preserved
            saveEditedPost(true, finalUpdatedPost); // Pass true to indicate silent save, and pass the complete post
          } catch (e) {
            console.error("Error in saveEditedPost callback:", e);
          }
        }
      } else {
        // Regular JSON request for text-only updates
        // Make sure to use the exact format and field names expected by the API
        const postData = {
          description: postToSave.content || '' // Using description field as required by the API
        };
        
        // If an image URL is already set, include it in the request
        if (postToSave.image) {
          postData.media = postToSave.image;
        }
        
        console.log("Sending JSON data:", postData);
        
        // Make API call to update the post - using proper token format
        const response = await fetch(`https://stage.suniyenetajee.com/api/v1/web/edit-post/${postToSave.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify(postData)
        });
        
        // Check for any error status and get full error details
        if (!response.ok) {
          let errorMessage = `Status: ${response.status} ${response.statusText}`;
          try {
            // Try to parse error as JSON
            const errorData = await response.json();
            console.error("API Error Response (JSON):", errorData);
            
            // Format error message from response
            if (typeof errorData === 'object') {
              const errorDetails = Object.entries(errorData)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
              errorMessage += ` - ${errorDetails}`;
            }
            
            // Check for specific error about media field
            if (errorMessage.includes("media: Expected a list") && !selectedFile && !selectedFiles.length) {
              // This is the case when no changes were made, just close the modal
              console.log("Media format error but no files selected, silently closing");
              closeModal();
              return;
            }
          } catch (e) {
            // If not JSON, get as text
            const errorText = await response.text();
            console.error("API Error Response (Text):", errorText);
            if (errorText) {
              errorMessage += ` - ${errorText}`;
            }
          }
          throw new Error(`Failed to update post: ${errorMessage}`);
        }
        
        const result = await response.json();
        console.log("Post updated successfully:", result);
        
        // Ensure important metadata is preserved in the response
        if (result && selectedPost) {
          // Preserve authorId for role display
          if (!result.authorId && selectedPost.authorId) {
            result.authorId = selectedPost.authorId;
          }
          
          // Preserve dates for display
          if (!result.date && selectedPost.date) {
            result.date = selectedPost.date;
          }
          if (!result.date_created && selectedPost.date_created) {
            result.date_created = selectedPost.date_created;
          }
          
          // Preserve status information
          if (!result.post_status && selectedPost.post_status) {
            result.post_status = selectedPost.post_status;
          }
          if (result.flagged === undefined && selectedPost.flagged !== undefined) {
            result.flagged = selectedPost.flagged;
          }
          if (result.isDeleted === undefined && selectedPost.isDeleted !== undefined) {
            result.isDeleted = selectedPost.isDeleted;
          }
          if (result.isApproved === undefined && selectedPost.isApproved !== undefined) {
            result.isApproved = selectedPost.isApproved;
          }
          
          // Preserve author information
          if (!result.author && selectedPost.author) {
            result.author = selectedPost.author;
          }
        }
        
        // Use the result data with preserved metadata for the final updated post
        const finalUpdatedPost = { ...result, ...postToSave };
        
        // Create a final post object with all necessary metadata preserved
        const completePost = {
          ...postToSave,
          // Ensure these critical fields are preserved from the original post
          authorId: postToSave.authorId || (selectedPost ? selectedPost.authorId : null),
          date: postToSave.date || (selectedPost ? selectedPost.date : null),
          date_created: postToSave.date_created || (selectedPost ? selectedPost.date_created : null),
          post_status: postToSave.post_status || (selectedPost ? selectedPost.post_status : null),
          flagged: postToSave.flagged !== undefined ? postToSave.flagged : (selectedPost ? selectedPost.flagged : false),
          isDeleted: postToSave.isDeleted !== undefined ? postToSave.isDeleted : (selectedPost ? selectedPost.isDeleted : false),
          isApproved: postToSave.isApproved !== undefined ? postToSave.isApproved : (selectedPost ? selectedPost.isApproved : false),
          author: postToSave.author || (selectedPost ? selectedPost.author : null)
        };
        
        // Clear the selected file after successful upload
        setSelectedFile(null);
        setPreviewUrl('');
        
        // Close the modal directly instead of waiting
        closeModal();
        
        // Show a success toast message
        showSuccessToast("Post updated successfully!");
        
        // Don't call any other callback that might trigger other modals
        // If needed, pass a flag to the parent component to refresh data
        if (typeof saveEditedPost === 'function') {
          try {
            // Call with the post that has all metadata preserved
            saveEditedPost(true, completePost); // Pass true to indicate silent save, and pass the complete post
          } catch (e) {
            console.error("Error in saveEditedPost callback:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error saving edited post:", error);
      
      // Don't show an alert for known cases where we're handling the error
      if (error.message && (
          // If message contains our special handling cases
          error.message.includes("silently closing") ||
          // Or if the message indicates no changes
          error.message.includes("No changes detected")
        )) {
        console.log("Handled error, not showing alert:", error.message);
      } else {
        // Show alert for actual errors
        alert(`Error saving post: ${error.message}`);
      }
    }
  };

  const closeModal = () => {
    // Clean up state to avoid affecting other modals
    if (typeof setEditedPost === 'function') {
      setEditedPost(null);
    }
    setLocalEditedPost(null);
    setIsEditMode(false);
    setShowImageEditor(false);
    setSelectedFile(null);
    setPreviewUrl('');
    
    // Directly close the modal without delays
    if (typeof onHide === 'function') {
      onHide();
    }
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

  const renderUserTypeBadge = () => {
    return isUserAdmin(selectedPost) ? (
      <Badge bg="dark" className="ms-2 px-2 py-1 text-white" style={{ fontSize: "0.7rem" }}>
        Admin
      </Badge>
    ) : (
      <Badge bg="secondary" className="ms-2 px-2 py-1 text-white" style={{ fontSize: "0.7rem" }}>
        Regular User
      </Badge>
    );
  };

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
          isUserAdmin(selectedPost) ? (
          <>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                  value={(editedPost || localEditedPost)?.title || ""}
                  onChange={handleLocalEditChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Content</label>
              <textarea
                className="form-control"
                rows={6}
                name="content"
                  value={(editedPost || localEditedPost)?.content || ""}
                  onChange={handleLocalEditChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Image URL</label>
                <input
                  type="text"
                  className="form-control"
                  name="image"
                  value={(editedPost || localEditedPost)?.image || ""}
                  onChange={handleLocalEditChange}
                  placeholder="Enter image URL"
                />
                {(editedPost || localEditedPost)?.image && (
                  <div className="mt-2">
                    <p className="text-muted mb-1 small">Image Preview:</p>
                    <img 
                      src={(editedPost || localEditedPost).image}
                      alt="Preview"
                      style={{ 
                        maxWidth: "100%", 
                        maxHeight: "150px", 
                        objectFit: "contain", 
                        borderRadius: "4px"
                      }}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Invalid+Image+URL"; }}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            // Show message if non-admin tries to edit
            <div className="alert alert-warning">
              Only admin users can edit their own posts. You don't have permission to edit this post.
            </div>
          )
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

              {/* Show inputs if admin post OR if forced via debug toggle */}
              {(isAdminPost(selectedPost) || isUserAdmin(selectedPost)) ? (
                <>
                  <h4 className="mb-3">{selectedPost.title || "No Title"}</h4>
                  
                  {/* Display the image with click-to-edit functionality if image exists */}
                  {selectedPost.image ? (
                    <div className="mb-3 text-center">
                      <img
                        src={selectedPost.image}
                        alt={selectedPost.title || ""}
                        style={{ 
                          maxWidth: "100%", 
                          width: "100%",
                          maxHeight: "280px", 
                          objectFit: "contain", 
                          borderRadius: "4px",
                          border: "1px dashed #ccc"
                        }}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Image+Unavailable"; }}
                      />
                      
                      {/* Multiple image upload section - single consolidated section */}
                      <div className="mt-4 mb-3">
                        <h5 className="mb-3">Add More Images</h5>
                        <div className="mb-3">
                          <label className="form-label">Select multiple images to upload</label>
                          <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handleMultipleFileSelect}
                            multiple
                            id="multipleFilesInput"
                            style={{ maxWidth: "100%", width: "100%" }}
                          />
                        </div>
                        
                        {previewUrls.length > 0 && (
                          <div className="selected-files-preview mb-3">
                            <label className="form-label">{previewUrls.length} Files Selected</label>
                            <div className="d-flex flex-wrap gap-2" style={{ overflowX: 'auto' }}>
                              {previewUrls.map((file, index) => (
                                <div key={index} className="position-relative" style={{ width: '120px' }}>
                                  <img 
                                    src={file.url} 
                                    alt={`Preview ${index}`} 
                                    className="img-thumbnail" 
                                    style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute"
                                    style={{ top: '-5px', right: '-5px', padding: '0.1rem 0.3rem' }}
                                    onClick={() => removeFile(index)}
                                  >
                                    <FiX size={14} />
                                  </button>
                                  <small className="d-block text-truncate" style={{ fontSize: '0.7rem' }}>
                                    {Math.round(file.size / 1024)} KB
                                  </small>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="button-group d-flex justify-content-end">
                          {previewUrls.length > 0 ? (
                            <button
                              className="btn btn-secondary me-2"
                              onClick={() => {
                                setSelectedFiles([]);
                                setPreviewUrls([]);
                              }}
                            >
                              Clear All Selection
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                // Trigger the file input click
                                document.getElementById('multipleFilesInput').click();
                              }}
                            >
                              Select Images
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // For posts without images, display file upload option
                    <div className="mb-3">
                      <div className="image-upload-container p-3 text-center" style={{
                        border: '2px dashed #ccc',
                        borderRadius: '8px',
                        backgroundColor: '#f8f9fa',
                        marginBottom: '20px'
                      }}>
                        <h5 className="mb-3">Add Images</h5>
                        <div className="mb-3">
                          <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handleMultipleFileSelect}
                            multiple
                            id="multipleFilesInputNoImage"
                            style={{ maxWidth: "100%", margin: "0 auto" }}
                          />
                        </div>
                        
                        {previewUrls.length > 0 && (
                          <div className="selected-files-preview mb-3">
                            <label className="form-label">{previewUrls.length} Files Selected</label>
                            <div className="d-flex flex-wrap gap-2 justify-content-center" style={{ overflowX: 'auto' }}>
                              {previewUrls.map((file, index) => (
                                <div key={index} className="position-relative" style={{ width: '120px' }}>
                                  <img 
                                    src={file.url} 
                                    alt={`Preview ${index}`} 
                                    className="img-thumbnail" 
                                    style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute"
                                    style={{ top: '-5px', right: '-5px', padding: '0.1rem 0.3rem' }}
                                    onClick={() => removeFile(index)}
                                  >
                                    <FiX size={14} />
                                  </button>
                                  <small className="d-block text-truncate" style={{ fontSize: '0.7rem' }}>
                                    {Math.round(file.size / 1024)} KB
                                  </small>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="button-group d-flex justify-content-center gap-2">
                          {previewUrls.length > 0 ? (
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                setSelectedFiles([]);
                                setPreviewUrls([]);
                              }}
                            >
                              Clear All Selection
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                // Trigger the file input click
                                document.getElementById('multipleFilesInputNoImage').click();
                              }}
                            >
                              Select Images
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label className="form-label">Content</label>
                    <textarea
                      className="form-control"
                      rows={6}
                      name="content"
                      value={(editedPost || localEditedPost)?.content || selectedPost.content || ""}
                      onChange={handleLocalEditChange}
                      style={{ cursor: "text" }}
                    />
                  </div>
                </>
              ) : (
                <>
              <h4 className="mb-3">{selectedPost.title || "No Title"}</h4>
              <p className="mb-4" style={{ whiteSpace: "pre-wrap" }}>{selectedPost.content || "No content available."}</p>
                </>
              )}

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
                  {(isAdminPost(selectedPost) || isUserAdmin(selectedPost)) && (
                    <Button 
                      variant="outline-dark" 
                      size="sm" 
                      className="me-1" 
                      onClick={() => {
                        // Initialize both editedPost states
                        const postCopy = JSON.parse(JSON.stringify(selectedPost));
                        setLocalEditedPost(postCopy);
                        if (typeof setEditedPost === 'function') {
                          setEditedPost(postCopy);
                        }
                        console.log("Enabling edit mode with post data:", postCopy);
                        enableEditMode();
                      }} 
                      title="Edit"
                    >
                      <FiEdit />
                    </Button>
                  )}
                  <Button variant="outline-danger" size="sm" className="me-1" title="Delete"><FiTrash /></Button>
                </div>
              </div>
            </>
          )
        )}
      </Modal.Body>

      <Modal.Footer style={{ borderTop: 'none' }}>
        {isEditMode ? (
          isUserAdmin(selectedPost) ? (
          <>
            <Button variant="secondary" onClick={cancelEditing}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  console.log("Save button clicked. editedPost:", editedPost);
                  handleSafeEditSave();
                }}
                style={{ backgroundColor: '#000', borderColor: '#000' }}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={cancelEditing}>Back</Button>
          )
        ) : (
          <>
            {isUserAdmin(selectedPost) ? (
              <>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    console.log("Save button clicked. editedPost:", editedPost);
                    if (!editedPost && selectedPost) {
                      console.log("editedPost not found, initializing from selectedPost");
                      const postCopy = JSON.parse(JSON.stringify(selectedPost));
                      if (typeof setEditedPost === 'function') {
                        setEditedPost(postCopy);
                        setTimeout(() => handleSafeEditSave(), 100);
                      } else {
                        console.error("setEditedPost function not available");
                      }
                    } else {
                      handleSafeEditSave();
                    }
                  }}
                  style={{ backgroundColor: '#000', borderColor: '#000' }}
                >
                  Save Changes
                </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onHide} style={{ backgroundColor: '#000', borderColor: '#000' }}>Close</Button>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PostDetailModal;
