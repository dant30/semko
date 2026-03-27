import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/features/auth/services/auth.api";
import { persistSession, clearSession } from "@/core/auth/auth-session";
import type { LoginPayload } from "@/core/types/auth";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginPayload>({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error on change
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);

    // Validation
    if (!formData.username || !formData.password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call login API
      const response = await authApi.login(formData);

      // Validate response
      if (!response.access || !response.refresh) {
        throw new Error("Invalid response from server: missing tokens");
      }

      // Persist session
      persistSession(response.access, response.refresh, response.user);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate to dashboard
        navigate("/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      // Handle specific error types
      if (err instanceof Error) {
        // Check for common API errors
        if (err.message.includes("401") || err.message.includes("Unauthorized")) {
          setError("Invalid username or password.");
        } else if (err.message.includes("Network") || err.message.includes("Network Error")) {
          setError("Network error. Please check your connection and try again.");
        } else if (err.message.includes("timeout")) {
          setError("Request timeout. Please try again.");
        } else {
          setError(err.message || "Login failed. Please try again.");
        }
      } else {
        setError("An unknown error occurred. Please try again.");
      }

      console.error("Login error:", err);
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200"
        >
          {error}
        </div>
      )}

      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          disabled={loading}
          value={formData.username}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            error && isSubmitted && !formData.username
              ? "border-red-300"
              : "border-gray-300"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          placeholder="Enter your username"
        />
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={loading}
          value={formData.password}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            error && isSubmitted && !formData.password
              ? "border-red-300"
              : "border-gray-300"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          placeholder="Enter your password"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-all ${
          loading
            ? "bg-blue-400 cursor-not-allowed opacity-75"
            : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
        }`}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {/* Forgot Password Link (Optional) */}
      <div className="text-center">
        <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
          Forgot password?
        </a>
      </div>
    </form>
  );
}

export default LoginForm;
