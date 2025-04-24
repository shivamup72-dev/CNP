import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import API from '../../api/endpoint';

const CreateUserOrAdminModal = ({
  show = false,
  onHide = () => { },
  handleCreateUser = () => { },
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    admin_role: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    gender: '',
    dob: '',
    picture: null,
    picturePreview: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Reset form states when modal opens
  useEffect(() => {
    if (show) {
      setFormErrors({});
      setApiError(null);
      setSuccessMessage(null);
      setFormSubmitted(false);
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let newValue = value;
    
    // Special handling for phone number formatting
    if (name === 'phone_number') {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Limit to 10 digits
      const truncated = digitsOnly.slice(0, 10);
      
      // Format as XXX-XXX-XXXX
      if (truncated.length > 6) {
        newValue = `${truncated.slice(0, 3)}-${truncated.slice(3, 6)}-${truncated.slice(6)}`;
      } else if (truncated.length > 3) {
        newValue = `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
      } else {
        newValue = truncated;
      }
    }
    
    setFormData({
      ...formData,
      [name]: newValue
    });
    
    // Clear any errors for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // Clear API error when user changes input
    if (apiError && (apiError.username || apiError.email)) {
      setApiError(null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          picture: file,
          picturePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email";
      }
    }
    if (!formData.password.trim()) errors.password = "Password is required";
    if (!formData.admin_role) errors.admin_role = "Admin role is required";
    if (!formData.first_name.trim()) errors.first_name = "First name is required";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required";
    
    // Phone number validation
    if (!formData.phone_number.trim()) {
      errors.phone_number = "Phone number is required";
    } else {
      // Remove any non-digit characters for validation
      const digitsOnly = formData.phone_number.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        errors.phone_number = "Phone number must be exactly 10 digits";
      }
    }
    
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.zip_code.trim()) errors.zip_code = "ZIP code is required";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.dob) errors.dob = "Date of birth is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createUser = async () => {
    if (!validateForm()) return;
    
    setIsCreatingUser(true);
    setApiError(null);
    setSuccessMessage(null);
    
    try {
      // Create FormData object
      const formDataObj = new FormData();
      
      // Append all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'picture') {
          // Only append the file if it exists
          if (value) {
            formDataObj.append(key, value);
          }
        } else if (value !== null && value !== undefined) {
          formDataObj.append(key, value);
        }
      });
      
      // Use the new API endpoint
      const data = await API.post('/api/v1/web/create-user/', formDataObj, {
        // Don't include Content-Type for FormData as it needs to set its own boundary
        headers: {}
      });
      
      // Success
      console.log('Success response:', data);
      const fullName = `${formData.first_name} ${formData.last_name}`;
      // Create shorter success message
      const successMsg = `${fullName} created successfully`;
      setSuccessMessage(successMsg);
      setFormSubmitted(true);
      
      // Call the parent component's handler with the success message
      handleCreateUser(formData, successMsg);
      
      // Close modal after a delay to show success message
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Add detailed error response logging
      console.log('Full error object:', error);
      console.log('Error response:', error.response);
      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
      }
      
      // Handle API error response
      if (error.response && error.response.status === 400) {
        setApiError(error.response.data);
      } else {
        setApiError({ general: error.message || 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleCreateWithEffect = () => {
    setIsButtonActive(true);
    createUser();
    setTimeout(() => setIsButtonActive(false), 300);
  };

  // Helper to create required field label
  const requiredLabel = (text) => (
    <Form.Label>
      {text} <span className="text-danger">*</span>
    </Form.Label>
  );

  // Admin role descriptions
  const getRoleDescription = (role) => {
    const descriptions = {
      'god_admin': 'Full system access',
      'national_manager': 'National-level management access',
      'state_manager': 'State-level management access',
      'city_manager': 'City-level management access',
      'ground_zero_reporter': 'Report creation access',
      'user': 'Basic user access'
    };
    return descriptions[role] || '';
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="custom-modal">
      <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '0.7rem' }}>
        <Modal.Title style={{ fontSize: '1.1rem' }}>Add New User or Admin</Modal.Title>
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

      <Modal.Body style={{ padding: '0.8rem', maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Success message */}
        {successMessage && (
          <Alert variant="success" className="mb-3 d-flex align-items-center py-2" style={{
            backgroundColor: 'rgba(25, 135, 84, 0.08)',
            borderColor: '#d1e7dd',
            borderLeft: '4px solid #198754',
            padding: '8px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            fontSize: '0.9rem'
          }}>
            <div className="me-2 fs-5 text-success">✓</div>
            <div>
              <span>{successMessage}</span>
            </div>
          </Alert>
        )}
        
        {/* General API error */}
        {apiError && apiError.general && (
          <Alert variant="danger" className="mb-3">
            {apiError.general}
          </Alert>
        )}
        
        {/* Add success styling */}
        <style>
          {`
            .form-success {
              animation: successPulse 1.5s ease-in-out;
            }
            
            @keyframes successPulse {
              0% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.5); }
              70% { box-shadow: 0 0 0 10px rgba(25, 135, 84, 0); }
              100% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); }
            }
          `}
        </style>
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              {requiredLabel("Username")}
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                isInvalid={!!formErrors.username || (apiError && !!apiError.username)}
                className={formSubmitted ? "form-success" : ""}
              />
              <Form.Control.Feedback type="invalid">
                {(apiError && apiError.username) ? apiError.username[0] : formErrors.username}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              {requiredLabel("Email")}
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!formErrors.email || (apiError && !!apiError.email)}
                className={formSubmitted ? "form-success" : ""}
              />
              <Form.Control.Feedback type="invalid">
                {(apiError && apiError.email) ? apiError.email[0] : formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              {requiredLabel("Password")}
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                isInvalid={!!formErrors.password}
                className={formSubmitted ? "form-success" : ""}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.password}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              {requiredLabel("Admin Role")}
              <Form.Select
                name="admin_role"
                value={formData.admin_role}
                onChange={handleInputChange}
                isInvalid={!!formErrors.admin_role}
                className={formSubmitted ? "form-success" : ""}
              >
                <option value="">Select Admin Role</option>
                <option value="god_admin">God Admin</option>
                <option value="national_manager">National Manager</option>
                <option value="state_manager">State Manager</option>
                <option value="city_manager">City Manager</option>
                <option value="ground_zero_reporter">Ground Zero Reporter</option>
                <option value="user">User</option>
              </Form.Select>
              {formData.admin_role && (
                <small className="text-muted d-block mt-1">
                  {getRoleDescription(formData.admin_role)}
                </small>
              )}
              <Form.Control.Feedback type="invalid">
                {formErrors.admin_role}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              {requiredLabel("First Name")}
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                isInvalid={!!formErrors.first_name}
                className={formSubmitted ? "form-success" : ""}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.first_name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              {requiredLabel("Last Name")}
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                isInvalid={!!formErrors.last_name}
                className={formSubmitted ? "form-success" : ""}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.last_name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              {requiredLabel("Phone Number")}
              <Form.Control
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                isInvalid={!!formErrors.phone_number}
                className={formSubmitted ? "form-success" : ""}
                placeholder="XXX-XXX-XXXX"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.phone_number}
              </Form.Control.Feedback>
              {!formErrors.phone_number && (
                <Form.Text className="text-muted">
                  Please enter a 10-digit phone number
                </Form.Text>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              {requiredLabel("Gender")}
              <Form.Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                isInvalid={!!formErrors.gender}
                className={formSubmitted ? "form-success" : ""}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.gender}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          {requiredLabel("Address")}
          <Form.Control
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            isInvalid={!!formErrors.address}
            className={formSubmitted ? "form-success" : ""}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.address}
          </Form.Control.Feedback>
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              {requiredLabel("City")}
              <Form.Control
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                isInvalid={!!formErrors.city}
                className={formSubmitted ? "form-success" : ""}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.city}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              {requiredLabel("State")}
              <Form.Control
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                isInvalid={!!formErrors.state}
                className={formSubmitted ? "form-success" : ""}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.state}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              {requiredLabel("ZIP Code")}
              <Form.Control
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                isInvalid={!!formErrors.zip_code}
                className={formSubmitted ? "form-success" : ""}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.zip_code}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              {requiredLabel("Date of Birth")}
              <Form.Control
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                isInvalid={!!formErrors.dob}
                className={formSubmitted ? "form-success" : ""}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.dob}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                isInvalid={!!formErrors.picture}
                className={formSubmitted ? "form-success" : ""}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.picture}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {formData.picturePreview && (
          <div className="text-center mb-3">
            <img
              src={formData.picturePreview}
              alt="Profile Preview"
              style={{
                maxWidth: '150px',
                maxHeight: '150px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          </div>
        )}
      </Modal.Body>

      <Modal.Footer style={{ padding: '0.5rem 0.8rem' }}>
        <Button variant="secondary" onClick={onHide} size="sm">
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
          disabled={isCreatingUser}
        >
          {isCreatingUser ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Creating...
            </>
          ) : "Create"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateUserOrAdminModal; 