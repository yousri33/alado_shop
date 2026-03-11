"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/orders");
        router.refresh();
      } else {
        setError(data.error || "خطأ في تسجيل الدخول");
      }
    } catch (err) {
      setError("حدث خطأ ما، يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f5f0",
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "white",
        borderRadius: "24px",
        padding: "2.5rem",
        boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
        border: "1px solid #e8e8e3",
        textAlign: "center"
      }}>
        {/* Logo */}
        <div style={{ marginBottom: "2rem" }}>
          <Image
            src="/alado logo.png"
            alt="Alado Logo"
            width={120}
            height={50}
            style={{ objectFit: "contain", margin: "0 auto" }}
          />
          <div style={{ 
            marginTop: "12px",
            fontSize: "0.7rem", 
            fontWeight: 900, 
            color: "var(--gold)",
            background: "rgba(245,197,24,0.1)",
            padding: "4px 12px",
            borderRadius: "99px",
            display: "inline-block",
            letterSpacing: "0.05em"
          }}>
            ADMIN PANEL
          </div>
        </div>

        <h1 style={{ fontWeight: 900, fontSize: "1.4rem", marginBottom: "0.5rem", color: "#111" }}>تسجيل الدخول</h1>
        <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "2rem" }}>يرجى إدخال بيانات الاعتماد للوصول</p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ textAlign: "right" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, marginBottom: "8px", color: "#444" }}>اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                height: "50px",
                padding: "0 1rem",
                borderRadius: "12px",
                border: "1px solid #ddd",
                outline: "none",
                fontSize: "0.95rem",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => (e.target.style.borderColor = "#111")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
          </div>

          <div style={{ textAlign: "right" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, marginBottom: "8px", color: "#444" }}>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                height: "50px",
                padding: "0 1rem",
                borderRadius: "12px",
                border: "1px solid #ddd",
                outline: "none",
                fontSize: "0.95rem",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => (e.target.style.borderColor = "#111")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
          </div>

          {error && (
            <div style={{ 
              color: "#ef4444", 
              fontSize: "0.8rem", 
              fontWeight: 700, 
              background: "#fee2e2", 
              padding: "10px", 
              borderRadius: "8px",
              marginTop: "5px"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              height: "54px",
              background: "#111",
              color: "white",
              borderRadius: "12px",
              border: "none",
              fontWeight: 800,
              fontSize: "1rem",
              marginTop: "1rem",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "transform 0.2s, background 0.2s",
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseOver={(e) => !isLoading && (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => !isLoading && (e.currentTarget.style.transform = "translateY(0)")}
          >
            {isLoading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <p style={{ marginTop: "2.5rem", fontSize: "0.75rem", color: "#bbb" }}>
          © {new Date().getFullYear()} Alado Shop. All rights reserved.
        </p>
      </div>
    </div>
  );
}
