"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Check for lock status on component mount
  useEffect(() => {
    const savedLockUntil = localStorage.getItem("loginLockUntil");
    const savedAttempts = localStorage.getItem("loginAttempts");

    if (savedLockUntil) {
      const lockTime = parseInt(savedLockUntil);
      if (Date.now() < lockTime) {
        setLockUntil(lockTime);
      } else {
        localStorage.removeItem("loginLockUntil");
        localStorage.removeItem("loginAttempts");
      }
    }

    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
  }, []);

  // Countdown timer for lock
  useEffect(() => {
    if (!lockUntil) return;

    const timer = setInterval(() => {
      const remaining = lockUntil - Date.now();
      if (remaining <= 0) {
        setLockUntil(null);
        setAttempts(0);
        localStorage.removeItem("loginLockUntil");
        localStorage.removeItem("loginAttempts");
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockUntil]);

  const handleChange = (e) => {
    // Basic XSS prevention - sanitize input
    const value = e.target.value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    setForm({ ...form, [e.target.name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email validation
    if (!form.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (!form.password) {
      toast.error("Password is required");
      return false;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    // Check if account is locked and reset if lock period has expired
    const savedLockUntil = localStorage.getItem("loginLockUntil");
    if (savedLockUntil) {
      const lockTime = parseInt(savedLockUntil);
      if (Date.now() < lockTime) {
        const remainingTime = Math.ceil((lockTime - Date.now()) / 1000 / 60);
        toast.error(`Account temporarily locked. Try again in ${remainingTime} minutes`);
        return false;
      } else {
        // Lock period has expired, reset everything
        localStorage.removeItem("loginLockUntil");
        localStorage.removeItem("loginAttempts");
        setLockUntil(null);
        setAttempts(0);
      }
    }

    return true;
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem("loginAttempts", newAttempts.toString());

    // Lock account after 5 failed attempts for 15 minutes
    if (newAttempts >= 5) {
      const lockTime = Date.now() + 15 * 60 * 1000; // 15 minutes
      setLockUntil(lockTime);
      localStorage.setItem("loginLockUntil", lockTime.toString());
      toast.error("Too many failed attempts. Account locked for 15 minutes.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple simultaneous submissions
    if (loading) return;

    // Validate form before submission
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Network error" }));

        handleFailedAttempt();

        // Specific error messages based on status code
        switch (res.status) {
          case 401:
            toast.error(errorData.message || "Invalid password");
            break;
          case 404:
            toast.error(errorData.message || "Email not found");
            break;
          case 403:
            toast.error("Account suspended or inactive");
            break;
          case 429:
            toast.error("Too many requests. Please try again later.");
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error(errorData.message || "Login failed");
        }
        return;
      }

      const data = await res.json();

      // Reset attempts on successful login
      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("loginLockUntil");
      setAttempts(0);
      setLockUntil(null);

      toast.success("Login successful 🎉", { duration: 4000 });

      // Redirect based on role
      setTimeout(() => {
        if (data.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }, 1000);

    } catch (err) {
      if (err.name === 'AbortError') {
        toast.error("Request timeout. Please try again.");
      } else {
        toast.error("Network error. Please check your connection.");
      }
      handleFailedAttempt();
    } finally {
      setLoading(false);
    }
  };

  const getLockMessage = () => {
    if (!lockUntil) return null;
    const remainingMinutes = Math.ceil((lockUntil - Date.now()) / 1000 / 60);
    return `Account locked. Try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-[#de5422] mb-6">
          <span className="text-gray-900">Log</span>in
        </h2>

        {lockUntil && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {getLockMessage()}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Email Field */}
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={lockUntil && Date.now() < lockUntil}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#de5422] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Field with Eye Icon */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$"//one upercase,one lowercase,one number,one special character at least 6 character
              disabled={lockUntil && Date.now() < lockUntil}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#de5422] disabled:bg-gray-100 disabled:cursor-not-allowed pr-12"

            />
            {/* Eye Icon Button */}
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={lockUntil && Date.now() < lockUntil}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                // Eye open icon (visible password)
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                // Eye closed icon (hidden password)
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || (lockUntil && Date.now() < lockUntil)}
            className="bg-[#de5422] cursor-pointer text-white py-2 rounded-lg font-semibold hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push("/forgetpassword")}
            className="text-sm text-[#de5422] hover:underline cursor-pointer"
          >
            Forgot your password?
          </button>
        </div>

        {/* Security notice */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>🔒 Your login is secure. We use industry-standard encryption.</p>
        </div>
      </form>
    </div>
  );
}