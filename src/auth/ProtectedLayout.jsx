import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

/**
 * ProtectedLayout serves as a container for protected routes
 * It checks authentication once and renders all nested child routes
 * through the Outlet component if authenticated
 */
const ProtectedLayout = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is authenticated by looking for the auth token in localStorage
  const isAuthenticated = localStorage.getItem("auth") === "true";

  console.log("ProtectedLayout: Initializing with auth =", isAuthenticated);

  // Log authentication state for debugging
  useEffect(() => {
    console.log("ProtectedLayout: Authentication state:", isAuthenticated);
    console.log("ProtectedLayout: Raw auth value:", localStorage.getItem("auth"));

    // If not authenticated, navigate to login
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      navigate("/");
    } else {
      console.log("User is authenticated, proceeding to protected content");
    }

    // Mark authentication as checked to avoid multiple redirects
    setAuthChecked(true);
  }, [isAuthenticated, navigate]);

  // During initial render, show nothing while authentication is being checked
  if (!authChecked) {
    console.log("Auth check in progress, showing loading state");
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFF8E1'
        }}
      >
        <div>Checking authentication...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    console.log("Auth check complete: Not authenticated, redirecting to login");
    return <Navigate to="/" />;
  }

  // If authenticated, render the outlet which will render the nested child routes
  console.log("Auth check complete: User authenticated, rendering protected content");
  return (
    <div
      className="protected-container"
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFF8E1' // Match the app's background color
      }}
    >
      <Outlet />
    </div>
  );
};

export default ProtectedLayout; 