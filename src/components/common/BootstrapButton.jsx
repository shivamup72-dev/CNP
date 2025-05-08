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
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: variant === "dark" ? "#000" : "#dee2e6",
        fontWeight: "500",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        textOverflow: "ellipsis",
        overflow: "hidden",
        maxWidth: '100%',
        transition: 'all 0.2s ease',
        ...style,
    };

    // Remove any border properties from the passed style to prevent conflicts
    const cleanStyle = { ...style };
    if (cleanStyle) {
        delete cleanStyle.border;
        delete cleanStyle.borderTop;
        delete cleanStyle.borderRight;
        delete cleanStyle.borderBottom;
        delete cleanStyle.borderLeft;
    }

    return (
        <BootstrapButton
            variant={variant}
            className={`custom-responsive-btn ${className}`}
            onClick={onClick}
            style={{...buttonStyle, ...cleanStyle}}
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
