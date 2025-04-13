import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useLoading } from "./LoadingContext";

/**
 * ProtectedLayout serves as a container for protected routes
 * It checks authentication once and renders all nested child routes
 * through the Outlet component if authenticated
 */
const ProtectedLayout = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const { setLoadingWithMessage } = useLoading();

  // Check if user is authenticated by looking for the auth token in localStorage
  const isAuthenticated = localStorage.getItem("auth") === "true";

  // Log authentication state for debugging
  useEffect(() => {
    setLoadingWithMessage(true, "Checking authentication...");

    // Simulate authentication check with a small delay
    setTimeout(() => {
      // If not authenticated, navigate to login
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        navigate("/");
      } else {
        console.log("User is authenticated, proceeding to protected content");
      }

      // Mark authentication as checked to avoid multiple redirects
      setAuthChecked(true);
      setLoadingWithMessage(false);
    }, 500);
  }, [isAuthenticated, navigate, setLoadingWithMessage]);

  // During initial render, show nothing while authentication is being checked
  if (!authChecked) {
    return null;
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // If authenticated, render the outlet which will render the nested child routes
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