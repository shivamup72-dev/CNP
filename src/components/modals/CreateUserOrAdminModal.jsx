import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import API from '../../api/endpoint';
import BootstrapButton from '../common/BootstrapButton';
import './CreateUserOrAdminModal.css';

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
    state_id: '',
    city_id: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (show) {
      setFormErrors({});
      setApiError(null);
      setSuccessMessage(null);
      setFormSubmitted(false);
      fetchStates();
      fetchCities();
    }
  }, [show]);

  useEffect(() => {
    if (formData.state_id) {
      const selectedState = states.find(state => state.id.toString() === formData.state_id.toString());
      const stateName = selectedState ? selectedState.name : '';
      
      const filtered = cities.filter(city => city.state === stateName);
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [formData.state_id, cities, states]);

  const fetchStates = async () => {
    try {
      setIsLoadingStates(true);
      const response = await API.get('/api/v1/master/state');
      console.log('States API response:', response);
      setStates(response.results || []);
    } catch (error) {
      console.error('Error fetching states:', error);
    } finally {
      setIsLoadingStates(false);
    }
  };

  const fetchCities = async () => {
    try {
      setIsLoadingCities(true);
      const response = await API.get('/api/v1/master/district');
      console.log('Cities API response:', response);
      setCities(response.results || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let newValue = value;
    
    if (name === 'phone_number') {
      const digitsOnly = value.replace(/\D/g, '');
      
      const truncated = digitsOnly.slice(0, 10);
      
      if (truncated.length > 6) {
        newValue = `${truncated.slice(0, 3)}-${truncated.slice(3, 6)}-${truncated.slice(6)}`;
      } else if (truncated.length > 3) {
        newValue = `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
      } else {
        newValue = truncated;
      }
    }
    
    if (name === 'state_id') {
      const selectedState = states.find(state => state.id.toString() === value.toString());
      
      setFormData(prevData => ({
        ...prevData,
        state_id: value ? parseInt(value, 10) : '',
        state: selectedState ? selectedState.name : '',
        city: '',
        city_id: ''
      }));
    } 
    else if (name === 'city_id') {
      const selectedCity = cities.find(city => city.id.toString() === value.toString());
      
      setFormData(prevData => ({
        ...prevData,
        city_id: value ? parseInt(value, 10) : '',
        city: selectedCity ? selectedCity.name : ''
      }));
    } 
    else {
      setFormData({
        ...formData,
        [name]: newValue
      });
    }
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
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
    
    if (!formData.phone_number.trim()) {
      errors.phone_number = "Phone number is required";
    } else {
      const digitsOnly = formData.phone_number.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        errors.phone_number = "Phone number must be exactly 10 digits";
      }
    }
    
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.state_id) errors.state_id = "State is required";
    if (!formData.city_id) errors.city_id = "City is required";
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
      // Get the field names from API response errors if we get a validation error
      // Create a data object with all possible field variations
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        admin_role: formData.admin_role,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number.replace(/\D/g, ''),
        address: formData.address,
        
        // Try multiple variations of state field
        state: parseInt(formData.state_id, 10),
        state_id: parseInt(formData.state_id, 10),
        
        // Try multiple variations of city/district field
        city: parseInt(formData.city_id, 10), 
        city_id: parseInt(formData.city_id, 10),
        district: parseInt(formData.city_id, 10),
        district_id: parseInt(formData.city_id, 10),
        
        zip_code: formData.zip_code,
        gender: formData.gender,
        dob: formData.dob,
      };
      
      // Create FormData object to send
      const formDataObj = new FormData();
      
      // Append all fields to FormData
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formDataObj.append(key, value);
          console.log(`Appended to FormData: ${key} = ${value}`);
        }
      });
      
      // Add picture separately if it exists
      if (formData.picture) {
        formDataObj.append('picture', formData.picture);
        console.log('Appended picture to FormData');
      }
      
      console.log('Sending FormData to API...');
      
      // Try using a direct fetch approach for more control over the request
      const apiUrl = `${API.BASE_URL}/api/v1/web/create-user/`;
      console.log(`API URL: ${apiUrl}`);
      
      // Add authorization headers
      const headers = API.getHeaders();
      console.log('Using headers:', headers);
      
      // Make the API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: formDataObj
      });
      
      console.log('API Response Status:', response.status);
      
      // Parse the response
      const data = await response.json();
      console.log('API Response Data:', data);
      
      if (!response.ok) {
        // If the response is not ok, throw an error with the response data
        throw { 
          response: {
            status: response.status,
            data: data
          } 
        };
      }
      
      // Success
      console.log('Success response:', data);
      
      // Determine if this is an admin or a user based on the role
      const isAdmin = formData.admin_role && formData.admin_role !== 'user';
      const userType = isAdmin ? 'Admin' : 'User';
      
      // Create success message without person's name
      const successMsg = `${userType} created successfully`;
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
      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
        
        // Log each field error for easier debugging
        if (error.response.data) {
          Object.entries(error.response.data).forEach(([field, errors]) => {
            console.log(`Field error - ${field}:`, errors);
          });
        }
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

  const requiredLabel = (text) => (
    <Form.Label>
      {text} <span className="text-danger">*</span>
    </Form.Label>
  );

  const getRoleDescription = (role) => {
    const descriptions = {
      'god_admin': 'Full system access',
      'national_manager': 'National-level management access',
      'state_manager': 'State-level management access',
      'city_manager': 'City-level management access',
      'ground_zero_reporter': 'Report creation access',
      'kyc_admin': 'KYC document verification and management access',
      'user': 'Basic access for regular users'
    };
    return descriptions[role] || '';
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="custom-modal">
      <Modal.Header style={{ position: 'relative', borderBottom: '1px solid #dee2e6', padding: '0.7rem' }}>
        <Modal.Title style={{ fontSize: '1.1rem' }}>Add New User or Admin</Modal.Title>
        <BootstrapButton
          variant="dark"
          onClick={onHide}
          className="btn-close-custom"
          style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '30px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        >
          <span style={{ 
            color: '#fff', 
            fontSize: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            lineHeight: '0.5',
            marginTop: '-2px'
          }}>×</span>
        </BootstrapButton>
      </Modal.Header>

      <Modal.Body style={{ padding: '0.8rem', maxHeight: '70vh', overflowY: 'auto' }}>
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
        
        {apiError && apiError.general && (
          <Alert variant="danger" className="mb-3">
            {apiError.general}
          </Alert>
        )}
        
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
              <div style={{ position: "relative" }}>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.password}
                  className={formSubmitted ? "form-success" : ""}
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#6c757d",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30px",
                    height: "30px",
                  }}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </div>
              </div>
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
                <option value="kyc_admin">KYC Admin</option>
                <option value="user">Regular User</option>
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
              {requiredLabel("State")}
              <Form.Select
                name="state_id"
                value={formData.state_id}
                onChange={handleInputChange}
                isInvalid={!!formErrors.state_id || (apiError && !!apiError.state)}
                className={formSubmitted ? "form-success" : ""}
                disabled={isLoadingStates}
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </Form.Select>
              {isLoadingStates && (
                <div className="mt-1">
                  <Spinner animation="border" size="sm" /> Loading states...
                </div>
              )}
              <Form.Control.Feedback type="invalid">
                {(apiError && apiError.state) ? apiError.state[0] : formErrors.state_id}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              {requiredLabel("City")}
              <Form.Select
                name="city_id"
                value={formData.city_id}
                onChange={handleInputChange}
                isInvalid={!!formErrors.city_id || (apiError && !!apiError.city)}
                className={formSubmitted ? "form-success" : ""}
                disabled={isLoadingCities || !formData.state_id}
              >
                <option value="">Select City</option>
                {filteredCities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Form.Select>
              {isLoadingCities && (
                <div className="mt-1">
                  <Spinner animation="border" size="sm" /> Loading cities...
                </div>
              )}
              <Form.Control.Feedback type="invalid">
                {(apiError && apiError.city) ? apiError.city[0] : formErrors.city_id}
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
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        )}
      </Modal.Body>

      <Modal.Footer style={{ padding: '0.5rem 0.8rem' }}>
        <BootstrapButton 
          variant="secondary" 
          onClick={onHide} 
          size="sm"
        >
          Cancel
        </BootstrapButton>
        <BootstrapButton
          variant="dark"
          onClick={handleCreateWithEffect}
          size="sm"
          className={isButtonActive ? 'pulse-effect' : ''}
          disabled={isCreatingUser}
          style={{
            backgroundColor: '#000',
            borderColor: '#000'
          }}
        >
          {isCreatingUser ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Creating...
            </>
          ) : (
            'Create User'
          )}
        </BootstrapButton>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateUserOrAdminModal; 