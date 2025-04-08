import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./screens/Dashboard/Dashboard";
import Login from "./screens/Auth/Login";
import Posts from "./screens/Dashboard/Posts";
import Demo from "./screens/Demo";
import PostReview from "./screens/Dashboard/PostReview";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/postreview" element={<PostReview />} />
        <Route path="/demo" element={<Demo />} />
      </Routes>
    </Router>
  );
};

export default App;
