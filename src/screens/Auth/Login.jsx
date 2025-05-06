import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Row, Col, Form } from "react-bootstrap";
import colors from "../../assets/css/colors.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { capitalizeFirstLetter } from "../../utils/Utility.js";
import BootstrapButton from "../../components/common/BootstrapButton";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Track window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load saved credentials on mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem("savedCredentials");
    if (savedCredentials) {
      try {
        const { savedEmail, savedPassword } = JSON.parse(savedCredentials);
        setEmail(savedEmail || "");
        setPassword(savedPassword || "");
        setRememberMe(true);
      } catch (error) {
        console.error("Error parsing saved credentials:", error);
        localStorage.removeItem("savedCredentials");
      }
    }
  }, []);

  // Clear authentication on login page load to ensure a clean state
  useEffect(() => {
    console.log("Login screen mounted, ensuring clean auth state");
    // Only clear auth if we're actually on the login page (not just passing through a redirect)
    if (window.location.pathname === '/') {
      localStorage.removeItem("auth");
    }
  }, []);

  // Responsive style calculations
  const getResponsiveStyles = () => {
    // Mobile breakpoint
    const isMobile = windowWidth < 576;

    return {
      heading: {
        fontSize: isMobile ? "1.2rem" : "1.5rem",
        marginBottom: isMobile ? "1rem" : "1.5rem",
      },
      input: {
        padding: isMobile ? "0.6rem" : "0.75rem",
        marginBottom: isMobile ? "0.8rem" : "1rem",
        fontSize: isMobile ? "0.9rem" : "1rem",
      },
      button: {
        padding: isMobile ? "0.6rem" : "0.75rem",
        fontSize: isMobile ? "1rem" : "1.1rem",
      },
      error: {
        fontSize: isMobile ? "0.85rem" : "0.95rem",
      },
      card: {
        padding: isMobile ? "1.5rem 1rem" : "2rem 1.5rem",
      },
      link: {
        fontSize: isMobile ? "0.85rem" : "0.9rem",
      },
      checkbox: {
        fontSize: isMobile ? "0.85rem" : "0.9rem",
      }
    };
  };

  const responsiveStyles = getResponsiveStyles();

  const handleLogin = async () => {
    // Reset error state
    setError("");
    console.log("Login attempt with:", { email, password });

    // Validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      // Make the API call to the login endpoint
      const response = await fetch("https://stage.suniyenetajee.com/api/v1/web/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login API Response Status:', response.status);
      
      const data = await response.json();
      console.log('Login API Response Data:', data);

      if (response.ok) {
        // Store authentication token
        localStorage.setItem("auth", "true");
        localStorage.setItem("token", data.key);
        
        // Store API token in the endpoint.js
        if (data.key) {
          console.log("Setting AUTH_TOKEN in API service:", data.key);
          // Note: In a real app, you'd update this through a context provider or Redux
          // This is just a temporary solution for this example
          localStorage.setItem("api_token", data.key);
        }
        
        // Parse and store user data
        const userData = {
          name: capitalizeFirstLetter(data.basic?.name || ""),
          email: data.basic?.email || "",
          role: data.basic?.admin_role || "user",
          isGodAdmin: data.basic?.admin_role === "god_admin",
          userId: data.basic?.user_id || null,
          profileId: data.basic?.profile_id || null
        };
        
        // Store user data in localStorage
        localStorage.setItem("userData", JSON.stringify(userData));
        console.log("User data stored:", userData);
        
        // Store user_id separately if needed for easier access
        if (data.basic?.user_id) {
          localStorage.setItem("user_id", data.basic.user_id);
          console.log("User ID stored:", data.basic.user_id);
        }
        
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem("savedCredentials", JSON.stringify({
            savedEmail: email,
            savedPassword: password
          }));
          console.log("Credentials saved to localStorage");
        } else {
          // Remove saved credentials if remember me is not checked
          localStorage.removeItem("savedCredentials");
        }
        
        // Navigate based on user role
        console.log("Checking user role for navigation:", userData.role);
        if (userData.role === "kyc_admin") {
          console.log("KYC admin detected, navigating to KYC dashboard...");
          navigate("/kyc-dashboard");
        } else {
          console.log("Regular user/admin detected, navigating to dashboard...");
          navigate("/dashboard");
        }
      } else {
        setError(data.message || data.non_field_errors?.[0] || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Something went wrong. Please try again later.");
    }
  };

  const handleKYCAdminLogin = async () => {
    // Set temporary auth data without making API call
    localStorage.setItem("auth", "true");
    localStorage.setItem("token", "temp_kyc_token");
    localStorage.setItem("api_token", "temp_kyc_token");
    
    const userData = {
      name: "KYC Admin",
      email: "kyc.admin@example.com",
      role: "kyc_admin",
      isGodAdmin: false,
      userId: "temp_kyc_id",
      profileId: "temp_kyc_profile"
    };
    
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("user_id", "temp_kyc_id");
    
    // Navigate directly to KYC dashboard
    navigate("/kyc-dashboard");
  };

  // Helper function to determine user role based on permissions
  const determineUserRole = (permissions) => {
    if (!permissions || permissions.length === 0) {
      return "Role not defined";
    }

    // Check if user has full access to all modules
    const hasFullAccess = permissions.every(module => 
      module.sub_modules.some(subModule => 
        subModule.name === "Full" && subModule.is_allowed === true
      )
    );

    // Return the appropriate role
    return hasFullAccess ? "God Admin" : "Role not defined";
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center px-3"
      style={{
        backgroundColor: colors.backgroundColor,
        minHeight: "100vh",
      }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={6} lg={3}>
          <Card
            className="shadow-sm"
            style={{
              borderRadius: "1rem",
              backgroundColor: "#fff",
              padding: windowWidth < 576 ? "1.5rem 1rem" : "2rem 1.5rem",
            }}
          >
            <h3
              style={{
                color: colors.primary_black,
                textAlign: "center",
                marginBottom: responsiveStyles.heading.marginBottom,
                fontSize: responsiveStyles.heading.fontSize,
              }}
            >
              Admin Login
            </h3>

            {error && (
              <p
                style={{
                  color: "red",
                  textAlign: "center",
                  fontSize: responsiveStyles.error.fontSize,
                }}
              >
                {error}
              </p>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: responsiveStyles.input.padding,
                marginBottom: responsiveStyles.input.marginBottom,
                border: "1px solid #ccc",
                borderRadius: "0.5rem",
                fontSize: responsiveStyles.input.fontSize,
              }}
            />
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: responsiveStyles.input.padding,
                  marginBottom: responsiveStyles.input.marginBottom,
                  border: "1px solid #ccc",
                  borderRadius: "0.5rem",
                  fontSize: responsiveStyles.input.fontSize,
                  paddingRight: "2.5rem",
                }}
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "27px",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: colors.primary_black,
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

            <div className="d-flex justify-content-between align-items-center mb-3">
              <Form.Check
                type="checkbox"
                id="remember-me"
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  fontSize: responsiveStyles.checkbox.fontSize,
                }}
              />
              <div
                style={{
                  fontSize: responsiveStyles.link.fontSize,
                  cursor: "pointer",
                  color: colors.btncolor
                }}
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </div>
            </div>

            <BootstrapButton
              style={{
                backgroundColor: colors.btncolor,
                borderColor: colors.btncolor,
                width: "100%",
                padding: responsiveStyles.button.padding,
                fontSize: responsiveStyles.button.fontSize,
                marginTop: 15
              }}
              onClick={handleLogin}
            >
              Login
            </BootstrapButton>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;