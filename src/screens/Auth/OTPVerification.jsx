import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import colors from "../../assets/css/colors.js";

const OTPVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [email, setEmail] = useState("");

  // Track window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get email from localStorage when component mounts and send OTP
  useEffect(() => {
    const resetEmail = localStorage.getItem("resetEmail");
    if (resetEmail) {
      setEmail(resetEmail);
      // Send OTP when component mounts
      sendOTP(resetEmail);
    } else {
      // If no email found, redirect back to forgot password
      navigate("/forgot-password");
    }
  }, [navigate]);

  // Function to send OTP
  const sendOTP = async (email) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('type', 'forgot');

      const response = await fetch("https://stage.suniyenetajee.com/api/v1/account/otp-resend/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status) {
        setSuccess(data.message || "OTP has been sent to your email");
        setError("");
      } else {
        // Show the specific error message from the backend
        setError(data.message || "Failed to send OTP. Please try again.");
        setSuccess("");
        // If user is not registered, redirect back to forgot password
        if (data.message === "There is no user register with this email.") {
          setTimeout(() => {
            navigate("/forgot-password");
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      setError("Something went wrong. Please try again later.");
      setSuccess("");
    }
  };

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

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('otp', otp);
      formData.append('type', 'forgot');

      const response = await fetch("https://stage.suniyenetajee.com/api/v1/account/verify-opt/", {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (data.message === "You have successfully verified the OTP.") {
        setSuccess(data.message);
        setError("");
        // Navigate to reset password screen after successful verification
        navigate("/reset-password");
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
        setSuccess("");
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      setError("Something went wrong. Please try again later.");
      setSuccess("");
    }
  };

  const handleResendOTP = async () => {
    await sendOTP(email);
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
              Verify OTP
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
                  color: "green",
                  textAlign: "center",
                  fontSize: responsiveStyles.error.fontSize,
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
              Please enter the OTP sent to your email address.
            </p>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{
                width: "100%",
                padding: responsiveStyles.input.padding,
                marginBottom: responsiveStyles.input.marginBottom,
                border: "1px solid #ccc",
                borderRadius: "0.5rem",
                fontSize: responsiveStyles.input.fontSize,
              }}
            />
            
            <Button
              style={{
                backgroundColor: colors.btncolor,
                borderColor: colors.btncolor,
                width: "100%",
                padding: responsiveStyles.button.padding,
                fontSize: responsiveStyles.button.fontSize,
                marginTop: 15
              }}
              onClick={handleVerifyOTP}
            >
              Verify OTP
            </Button>

            <div 
              style={{
                textAlign: "center",
                marginTop: "1.5rem",
                fontSize: responsiveStyles.error.fontSize,
                cursor: "pointer",
                color: colors.btncolor
              }}
              onClick={handleResendOTP}
            >
              Resend OTP
            </div>

            <div 
              style={{
                textAlign: "center",
                marginTop: "1rem",
                fontSize: responsiveStyles.error.fontSize,
                cursor: "pointer",
                color: colors.btncolor
              }}
              onClick={() => navigate("/forgot-password")}
            >
              Back to Forgot Password
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OTPVerification; 