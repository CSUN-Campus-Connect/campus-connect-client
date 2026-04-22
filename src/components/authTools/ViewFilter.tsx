"use client";
import React from "react";

interface PasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  autoComplete?: string;
}

export default function PasswordField({
  value,
  onChange,
  placeholder = "Password",
  style = {},
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  autoComplete,
}: PasswordFieldProps) {
  const [show, setShow] = React.useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 15px",
    paddingRight: "48px",
    borderRadius: "999px",
    border: "1px solid #d0d0d0",
    backgroundColor: "#f5f5f5",
    fontSize: "0.95rem",
    ...style,
  };

  const buttonStyle: React.CSSProperties = {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "none",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        id={id}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        autoComplete={autoComplete}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
      />

      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        style={buttonStyle}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          // 🔒 Eye Closed Icon SVG
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b00020"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-5.52 0-10-4-10-8 0-1.61.5-3.11 1.36-4.36M6.1 6.1A9.86 9.86 0 0112 4c5.52 0 10 4 10 8a7.72 7.72 0 01-1.67 4.58M1 1l22 22" />
            <path d="M9.88 9.88A3 3 0 0112 9a3 3 0 013 3c0 .7-.24 1.34-.64 1.84" />
          </svg>
        ) : (
          // 🔓 Eye Open Icon SVG
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b00020"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          </svg>
        )}
      </button>
    </div>
  );
}
