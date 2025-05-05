import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

/**
 * ProtectedLayout serves as a container for protected routes
 * It checks authentication once and renders all nested child routes
 * through the Outlet component if authenticated
 * 
 * If you don't use ProtectedLayout, several security and user experience issues would arise:
1) No Authentication Protection:
i) Anyone could directly access sensitive routes like /dashboard, /postsection, and /access-control by typing the URLs
ii)There would be no check if the user is logged in or not
iii) Example: An unauthenticated user could type yourwebsite.com/dashboard and access the dashboard directly
 */
const ProtectedLayout = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is authenticated by looking for the auth token in localStorage
  const isAuthenticated = localStorage.getItem("auth") === "true";

  // Handle authentication state
  useEffect(() => {
    // If not authenticated, navigate to login
    if (!isAuthenticated) {
      navigate("/");
    }

    // Mark authentication as checked to avoid multiple redirects
    setAuthChecked(true);
  }, [isAuthenticated, navigate]);

  // During initial render, show nothing while authentication is being checked
  if (!authChecked) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8fcf8'
        }}
      >
        <div>Checking authentication...</div>
      </div>
    );
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
        backgroundColor: '#f8fcf8' // Match the app's background color
      }}
    >
      <Outlet />
    </div>
  );
};

export default ProtectedLayout; 