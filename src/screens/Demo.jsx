// src/screens/Demo.jsx
import React from "react";
import { Button } from "react-bootstrap";

const Demo = () => {
  const handleClick = () => {
    alert("Button Clicked!");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f8f9fa"
    }}>
      <Button onClick={handleClick} variant="primary" size="lg">
        Click Me
      </Button>
    </div>
  );
};

export default Demo;
