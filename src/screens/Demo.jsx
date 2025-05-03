// src/screens/Demo.jsx
import React from "react";
import BootstrapButton from "../components/common/BootstrapButton";

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
      <BootstrapButton onClick={handleClick} variant="primary" size="lg">
        Click Me
      </BootstrapButton>
    </div>
  );
};

export default Demo;
