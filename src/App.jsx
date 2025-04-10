import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./screens/Auth/Login";
import ForgotPassword from "./screens/Auth/ForgotPassword";
import Dashboard from "./screens/Dashboard/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Posts from "./screens/Dashboard/Posts";
import Demo from "./screens/Demo";
import PostReview from "./screens/Dashboard/PostReview";
import AccessControl from "./screens/AccessControl/AccessControl";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/posts" element={<Posts />} />
        <Route path="/postreview" element={<PostReview />} />
        <Route path="/demo" element={<Demo />} />
        <Route
          path="/access-control"
          element={
            <PrivateRoute>
              <AccessControl />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
