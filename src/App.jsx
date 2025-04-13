import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./screens/Auth/Login";
import ForgotPassword from "./screens/Auth/ForgotPassword";
import Dashboard from "./screens/Dashboard/Dashboard";
import Demo from "./screens/Demo";
import PostSection from "./screens/Dashboard/postSection/PostSection.jsx";
import AccessControl from "./screens/AccessControl/AccessControl";
import ProtectedLayout from "./auth/ProtectedLayout";

const App = () => {
  // Log when the app renders
  useEffect(() => {
    console.log("App component rendered");
    console.log("Auth status:", localStorage.getItem("auth"));
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/demo" element={<Demo />} />

        {/* Protected routes nested under ProtectedLayout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/postsection" element={<PostSection />} />
          <Route path="/access-control" element={<AccessControl />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
