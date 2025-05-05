import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./screens/Auth/Login";
import ForgotPassword from "./screens/Auth/ForgotPassword";
import OTPVerification from "./screens/Auth/OTPVerification";
import ResetPassword from "./screens/Auth/ResetPassword";
import Dashboard from "./screens/Dashboard/Dashboard";
import Demo from "./screens/Demo";
import PostSection from "./screens/Dashboard/postSection/PostSection.jsx";
import AccessControl from "./screens/AccessControl/AccessControl";
import KYCDashboard from "./screens/KYC/KYCDashboard";
import ProtectedLayout from "./auth/ProtectedLayout";

const App = () => {
  return (
    <Router>
      {/* Toast container for notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/demo" element={<Demo />} />

        {/* Protected routes nested under ProtectedLayout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/postsection" element={<PostSection />} />
          <Route path="/access-control" element={<AccessControl />} />
          <Route path="/kyc-dashboard" element={<KYCDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
