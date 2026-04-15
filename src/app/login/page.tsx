"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { api } from "../../lib/axios";
import { PublicUser, UserType } from "@/types/profile";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if(user) {
        console.log("stored user:", user);
        router.push("/dashboard");
    }
  }, [router]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  })

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    try {
      const response = await api.post<{ token: string, sessionId: string, user: PublicUser}>("/api/v1/users/login", loginData);
      const user: PublicUser = response.data.user;

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("sessionId", response.data.sessionId);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      router.push("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "/login/page.tsx/handleSubmit: Something went wrong");
    }

  }

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* 🔹 Background Video */}
      <video
        src="https://live-csu-northridge.pantheonsite.io/sites/default/files/2025-09/Generic%20Webpage%20Final%20New%20Bitrate.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      />

      {/* 🔹 Glass Container */}
      <div
        style={{
          display: "flex",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255,255,255,0.2)",
          borderRadius: "20px",
          boxShadow: "0 0 20px rgba(0,0,0,0.2)",
          width: "850px",
          height: "500px",
          overflow: "hidden",
        }}
      >
        {/* Left Section - Logo */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.25)",
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/en/2/2a/California_State_University%2C_Northridge_seal.svg"
            alt="CSUN Logo"
            style={{ width: "250px", height: "250px" }}
          />
        </div>

        {/* Right Section - Login Form */}
        <div
          style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.9)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px",
          }}
        >
          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/8d/Matador_logo.png"
              alt="Toro Logo"
              style={{ width: "100px", marginBottom: "10px" }}
            />
            <h2 style={{ margin: 0, fontWeight: "600" }}>Toro Campus Connect</h2>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Input Fields */}
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              required
              style={{
                width: "80%",
                padding: "10px 15px",
                margin: "10px 0",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              required
              style={{
                width: "80%",
                padding: "10px 15px",
                margin: "10px 0",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
          
            <a
              href="#"
              style={{
                fontSize: "0.85rem",
                color: "crimson",
                alignSelf: "flex-end",
                marginRight: "45px",
                textDecoration: "none",
              }}
            >
              Forgot password?
            </a>

            {/* Login Button */}
            <button
              type="submit"
              style={{
                width: "80%",
                marginTop: "20px",
                backgroundColor: "crimson",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </form>
          {/* Sign Up Link */}
          <p style={{ marginTop: "15px", fontSize: "0.9rem" }}>
            Don’t have an account?{" "}
            <a
              href="/register"
              style={{
                color: "crimson",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
