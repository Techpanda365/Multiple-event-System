"use client";

import { useState } from "react";

type LoginType = "superadmin" | "company";

export default function LoginPage() {
  const [loginType, setLoginType] = useState<LoginType>("superadmin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);

    try {
      const endpoint = loginType === "superadmin" ? "/api/admin/login" : "/api/company/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("access_token", data.token);
      }
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      window.location.href = loginType === "superadmin" ? "/admin" : "/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-8 bg-card rounded-lg shadow-lg border border-border">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to Dash SaaS</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => { setLoginType("superadmin"); setError(""); }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${loginType === "superadmin" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Super Admin
          </button>
          <button
            onClick={() => { setLoginType("company"); setError(""); }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${loginType === "company" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Company Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={loginType === "superadmin" ? "admin@techpanda.com" : "company@example.com"}
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="text-right">
            <a href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot Password?
            </a>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {loginType === "superadmin" && (
          <div className="text-center text-xs text-muted-foreground">
            <p>Super Admin: admin@techpanda.com</p>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-primary hover:underline font-medium">Sign up</a>
        </div>
      </div>
    </div>
  );
}
