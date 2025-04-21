import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import API from '../../api/endpoint';

const CreateUserOrAdminModal = ({
  show = false,
  onHide = () => { },
  handleCreateUser = () => { },
}) => {
  const [formData, setFormData] = useState({
    username: 'kari_2',
    email: 'kari_2@gmail.com',
    password: 'koko',
    permission: '1',
    first_name: 'kari',
    last_name: 'singh',
    phone_number: '9319939217',
    address: 'sec-62 noida',
    city: '1',
    state: '1',
    zip_code: '201301',
    gender: 'Female',
    dob: '1999-11-28',
    picture: null,
    picturePreview: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch permissions when modal opens
  useEffect(() => {
    if (show) {
      fetchPermissions();
      // Reset states when modal opens
      setFormErrors({});
      setApiError(null);
      setSuccessMessage(null);
    }
  }, [show]);

  const fetchPermissions = async () => {
    try {
      setIsLoadingPermissions(true);
      setPermissionError(null);
      
      const data = await API.get('/api/v1/web/functionality-permission');
      console.log('Permissions data:', data);
      setPermissions(data);
      
      // If permissions were fetched successfully but the current permission is not in the list,
      // update to the first permission in the list
      if (data.length > 0 && !data.some(p => p.id.toString() === formData.permission)) {
        setFormData(prev => ({
          ...prev,
          permission: data[0].id.toString()
        }));
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissionError('Failed to load permissions. Please try again.');
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
    if (!formData.permission) errors.permission = "Permission is required";
    if (!formData.first_name.trim()) errors.first_name = "First name is required";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required";
    if (!formData.phone_number.trim()) errors.phone_number = "Phone number is required";
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
      
      // Make API call with our centralized wrapper that handles authentication
      const data = await API.post('/api/v1/web/create-user/', formDataObj, {
        // Don't include Content-Type for FormData as it needs to set its own boundary
        headers: {}
      });
      
      // Success
      console.log('Success response:', data);
      setSuccessMessage(data.message || 'User created successfully!');
      
      // Call the parent component's handler
      handleCreateUser(formData);
      
      // Close modal after a delay to show success message
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (error) {
      console.error('Error creating user:', error);
      
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

  // Get the help text for the selected permission
  const getPermissionHelpText = (permissionId) => {
    if (permissionId === "1") {
      return "Admin has full access";
    } else if (permissionId === "2") {
      return "Moderator has limited access";
    }
    return "";
  };

  // Render permissions dropdown based on API data
  const renderPermissionsDropdown = () => {
    if (isLoadingPermissions) {
      return (
        <div className="d-flex align-items-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Loading permissions...</span>
        </div>
      );
    }

    if (permissionError) {
      return (
        <div className="text-danger">
          {permissionError}
          <Button 
            variant="link" 
            size="sm" 
            className="p-0 ms-2" 
            onClick={fetchPermissions}
          >
            Retry
          </Button>
        </div>
      );
    }

    return (
      <>
        <Form.Select
          name="permission"
          value={formData.permission}
          onChange={handleInputChange}
          isInvalid={!!formErrors.permission}
        >
          {permissions.length > 0 ? (
            permissions.map(permission => (
              <option key={permission.id} value={permission.id.toString()}>
                {permission.name} - {permission.id === 1 ? "has full access" : "has limited access"}
              </option>
            ))
          ) : (
            <>
              <option value="1">Admin - has full access</option>
              <option value="2">Moderator - has limited access</option>
            </>
          )}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {formErrors.permission}
        </Form.Control.Feedback>
      </>
    );
  };

  // Helper to create required field label
  const requiredLabel = (text) => (
    <Form.Label>
      {text} <span className="text-danger">*</span>
    </Form.Label>
  );

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
          <Alert variant="success" className="mb-3">
            {successMessage}
          </Alert>
        )}
        
        {/* General API error */}
        {apiError && apiError.general && (
          <Alert variant="danger" className="mb-3">
            {apiError.general}
          </Alert>
        )}
        
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
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.password}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              {requiredLabel("Permission")}
              {renderPermissionsDropdown()}
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
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.phone_number}
              </Form.Control.Feedback>
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
              >
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
          disabled={isLoadingPermissions || isCreatingUser}
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