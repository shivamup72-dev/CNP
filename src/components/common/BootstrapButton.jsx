import React from "react";
import { Button as BootstrapButton } from "react-bootstrap";
import "./buttonStyles.css"; // Will create this file after

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
}) => {
    // Common button styling
    const buttonStyle = {
        backgroundColor: variant === "dark" ? "#000" : undefined,
        borderColor: variant === "dark" ? "#000" : undefined,
        fontWeight: "500",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        textOverflow: "ellipsis",
        overflow: "hidden",
        maxWidth: '100%',
        ...style,
    };

    return (
        <BootstrapButton
            variant={variant}
            className={`custom-responsive-btn ${className}`}
            onClick={onClick}
            style={buttonStyle}
            size={size || 'sm'}
            disabled={disabled}
            type={type}
            {...rest}
        >
            {children}
        </BootstrapButton>
    );
};

export default Button;
