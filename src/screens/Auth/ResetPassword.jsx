import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import colors from "../../assets/css/colors.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");

  // Track window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get email from localStorage when component mounts
  useEffect(() => {
    const resetEmail = localStorage.getItem("resetEmail");
    if (resetEmail) {
      setEmail(resetEmail);
    } else {
      // If no email found, redirect back to forgot password
      navigate("/forgot-password");
    }
  }, [navigate]);

  // Responsive style calculations
  const getResponsiveStyles = () => {
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
    };
  };

  const responsiveStyles = getResponsiveStyles();

  const handleResetPassword = async () => {
    // Reset error state
    setError("");
    setSuccess("");

    // Validation
    if (!newPassword || !confirmPassword) {
      setError("Please enter both passwords");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', newPassword);
      formData.append('confirm_password', confirmPassword);
      formData.append('type', 'forgot');

      const response = await fetch("https://stage.suniyenetajee.com/api/v1/account/change-password/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.message) {
        setSuccess("Password changed successfully!");
        setError("");
        // Clear the reset email from localStorage
        localStorage.removeItem("resetEmail");
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password. Please try again.");
        setSuccess("");
      }
    } catch (error) {
      console.error('Reset Password Error:', error);
      setError("Something went wrong. Please try again later.");
      setSuccess("");
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
              Reset Password
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

            {success && (
              <p
                style={{
                  color: "#28a745",
                  textAlign: "center",
                  fontSize: responsiveStyles.error.fontSize,
                  fontWeight: "bold",
                  marginBottom: "1rem"
                }}
              >
                {success}
              </p>
            )}

            <p
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                fontSize: responsiveStyles.error.fontSize,
              }}
            >
              Please enter your new password.
            </p>

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </div>
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
              onClick={handleResetPassword}
            >
              Reset Password
            </Button>

            <div
              style={{
                textAlign: "center",
                marginTop: "1rem",
                fontSize: responsiveStyles.error.fontSize,
                cursor: "pointer",
                color: colors.btncolor
              }}
              onClick={() => navigate("/")}
            >
              Back to Login
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword; 