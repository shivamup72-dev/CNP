import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  // Check if user is authenticated by looking for the auth token in localStorage
  const isAuthenticated = localStorage.getItem("auth") === "true";

  // If authenticated, render the children (protected component)
  // If not authenticated, redirect to login page
  return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute; 