import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import colors from "../../assets/css/colors.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showPassword, setShowPassword] = useState(false);

  // Track window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
      console.log("Setting auth token in localStorage");
      localStorage.setItem("auth", "true");
      console.log("Auth token set:", localStorage.getItem("auth"));

      console.log("Navigating to dashboard...");
      navigate("/dashboard");
      console.log("Navigation to dashboard initiated");

      // Uncomment the API code below when backend is ready
      /*
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
        localStorage.setItem("auth", "true");
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
      */
    } catch (error) {
      console.error('Login error:', error);
      setError("Something went wrong. Please try again later.");
    }
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

            <div
              style={{
                textAlign: "right",
                marginBottom: "1rem",
                fontSize: responsiveStyles.link.fontSize,
                cursor: "pointer",
                color: colors.btncolor
              }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </div>

            <Button
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
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;