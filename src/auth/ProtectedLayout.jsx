import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";

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
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is authenticated by looking for the auth token in localStorage
  const isAuthenticated = localStorage.getItem("auth") === "true";

  // Get user data from localStorage
  const getUserData = () => {
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      try {
        return JSON.parse(userDataStr);
      } catch (e) {
        console.error("Error parsing user data:", e);
        return null;
      }
    }
    return null;
  };

  // Handle authentication and authorization
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    } else {
      const userData = getUserData();
      const currentPath = location.pathname;

      // If user is KYC admin
      if (userData?.role === "kyc_admin") {
        // Only allow access to KYC dashboard
        if (currentPath !== "/kyc-dashboard") {
          console.log("KYC admin attempting to access unauthorized route, redirecting to KYC dashboard...");
          navigate("/kyc-dashboard");
        }
      } else {
        // For non-KYC admins, prevent access to KYC dashboard
        if (currentPath === "/kyc-dashboard") {
          console.log("Non-KYC admin attempting to access KYC dashboard, redirecting to main dashboard...");
          navigate("/dashboard");
        }
      }
    }

    setAuthChecked(true);
  }, [isAuthenticated, navigate, location]);

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
  return <Outlet />;
};

export default ProtectedLayout; 