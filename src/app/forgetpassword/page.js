"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email input, 2: OTP verification, 3: New password
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && step === 2) {
      setCanResend(true);
    }
  }, [countdown, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Sanitize input
    const sanitizedValue = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

    setForm(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Auto-submit OTP when 6 digits are entered
    if (name === "otp" && sanitizedValue.length === 6) {
      handleVerifyOTP();
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const validatePassword = (password, confirmPassword) => {
    if (!password) {
      toast.error("New password is required");
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
      toast.error("Password must include uppercase, lowercase, number, and special character");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();

    if (loading) return;

    if (!validateEmail(form.email)) return;

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          action: "send_otp"
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok) {
        toast.success("Verification code sent to your email 📧", { duration: 4000 });
        setStep(2);
        setCountdown(60); // 1 minute countdown
        setCanResend(false);
      } else {
        switch (res.status) {
          case 404:
            toast.error("No account found with this email address");
            break;
          case 429:
            toast.error("Too many attempts. Please try again later.");
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error(data.message || "Failed to send verification code");
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.error("Request timeout. Please try again.");
        console.log("email error:", error)
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase()
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok) {
        toast.success("New verification code sent 📧", { duration: 4000 });
        setCountdown(60);
        setCanResend(false);
      } else {
        toast.error(data.message || "Failed to resend code");
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.error("Request timeout. Please try again.");
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (loading) return;

    if (!form.otp || form.otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          otp: form.otp
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok) {
        toast.success("Code verified successfully ✅", { duration: 3000 });
        setStep(3);
      } else {
        switch (res.status) {
          case 400:
            toast.error("Invalid or expired verification code");
            break;
          case 404:
            toast.error("No pending reset request found");
            break;
          default:
            toast.error(data.message || "Verification failed");
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.error("Request timeout. Please try again.");
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!validatePassword(form.newPassword, form.confirmPassword)) return;

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          otp: form.otp,
          newPassword: form.newPassword
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successful! 🎉", { duration: 3000 });

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        switch (res.status) {
          case 400:
            toast.error("Invalid or expired reset request");
            break;
          case 401:
            toast.error("Verification failed. Please start over.");
            break;
          default:
            toast.error(data.message || "Password reset failed");
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.error("Request timeout. Please try again.");
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Reset Your Password";
      case 2:
        return "Verify Your Email";
      case 3:
        return "Create New Password";
      default:
        return "Reset Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Enter your email address and we'll send you a verification code";
      case 2:
        return `We sent a 6-digit code to ${form.email}`;
      case 3:
        return "Create a new secure password for your account";
      default:
        return "";
    }
  };

  // Progress bar component
  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className={`text-sm font-medium ${step >= 1 ? "text-[#de5422]" : "text-gray-400"}`}>
          Enter Email
        </div>
        <div className={`text-sm font-medium ${step >= 2 ? "text-[#de5422]" : "text-gray-400"}`}>
          Verify Code
        </div>
        <div className={`text-sm font-medium ${step >= 3 ? "text-[#de5422]" : "text-gray-400"}`}>
          New Password
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-[#de5422] h-2 rounded-full transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        {/* Back button */}
        <button
          onClick={() => step === 1 ? router.push("/login") : setStep(step - 1)}
          className="flex items-center text-[#de5422] hover:text-gray-800 mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h2 className="text-3xl font-bold text-center text-[#de5422] mb-2">
          {getStepTitle()}
        </h2>

        <p className="text-center text-gray-600 mb-6">
          {getStepDescription()}
        </p>

        <ProgressBar />

        <form onSubmit={
          step === 1 ? handleSendOTP :
            step === 2 ? (e) => { e.preventDefault(); handleVerifyOTP(); } :
              handleResetPassword
        }>
          {/* Step 1: Email Input */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#de5422]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#de5422] text-white py-3 rounded-lg font-semibold hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Code...
                  </span>
                ) : (
                  "Send Verification Code"
                )}
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit code"
                  value={form.otp}
                  onChange={handleChange}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#de5422] text-center text-xl tracking-widest"
                  required
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend code in {countdown} seconds
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={!canResend || loading}
                    className="text-[#de5422] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resend verification code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || form.otp.length !== 6}
                className="w-full bg-[#de5422] text-white py-3 rounded-lg font-semibold hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify Code"
                )}
              </button>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Enter new password"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#de5422]"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#de5422]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#de5422] text-white py-3 rounded-lg font-semibold hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting Password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          )}
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 text-center">
            🔒 Your security is important to us. We use encrypted connections and never share your data.
          </p>
        </div>

        {/* Back to Login */}
        <p className="mt-6 text-center text-gray-700">
          Remember your password?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-[#de5422] hover:underline cursor-pointer font-medium"
          >
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
}