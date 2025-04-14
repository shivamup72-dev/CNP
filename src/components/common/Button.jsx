import React from "react";
import { Button as BootstrapButton } from "react-bootstrap";

const Button = ({
  variant = "dark",
  className = "",
  children,
  onClick,
  style,
  size,
  disabled,
  type = "button",
  ...rest
}) => (
  <BootstrapButton
    variant={variant}
    className={`px-3 py-2 ${className}`}
    onClick={onClick}
    style={{
      backgroundColor: variant === "dark" ? "#000" : undefined,
      borderColor: variant === "dark" ? "#000" : undefined,
      fontWeight: "500",
      padding: "0.375rem 0.75rem",
      ...style,
    }}
    size={size}
    disabled={disabled}
    type={type}
    {...rest}
  >
    {children}
  </BootstrapButton>
);

export default Button; 