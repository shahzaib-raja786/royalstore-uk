"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Password strength calculator
  useEffect(() => {
    if (!form.password) {
      setPasswordStrength("");
      return;
    }

    let strength = 0;
    let messages = [];

    // Length check
    if (form.password.length >= 8) strength++;
    else messages.push("at least 8 characters");

    // Upper case check
    if (/[A-Z]/.test(form.password)) strength++;
    else messages.push("one uppercase letter");

    // Lower case check
    if (/[a-z]/.test(form.password)) strength++;
    else messages.push("one lowercase letter");

    // Number check
    if (/[0-9]/.test(form.password)) strength++;
    else messages.push("one number");

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) strength++;
    else messages.push("one special character");

    const strengthLabels = {
      0: "Very Weak",
      1: "Weak",
      2: "Fair",
      3: "Good",
      4: "Strong",
      5: "Very Strong"
    };

    setPasswordStrength({
      level: strength,
      label: strengthLabels[strength] || "Very Weak",
      message: messages.length > 0 ? `Needs: ${messages.join(", ")}` : ""
    });
  }, [form.password]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s]*$/.test(value)) {
          newErrors.name = "Name can only contain letters and spaces";
        } else if (value.trim().length > 50) {
          newErrors.name = "Name must be less than 50 characters";
        } else {
          delete newErrors.name;
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = "Email is required";
        } else if (!emailRegex.test(value)) {
          newErrors.email = "Please enter a valid email address";
        } else if (value.length > 100) {
          newErrors.email = "Email must be less than 100 characters";
        } else {
          delete newErrors.email;
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(value)) {
          newErrors.password = "Password must include uppercase, lowercase, number, and special character";
        } else if (value.length > 100) {
          newErrors.password = "Password must be less than 100 characters";
        } else {
          delete newErrors.password;
        }
        break;

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== form.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Basic XSS prevention
    const sanitizedValue = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    
    setForm(prev => ({ 
      ...prev, 
      [name]: sanitizedValue 
    }));

    // Validate field if it's been touched
    if (touched[name]) {
      validateField(name, sanitizedValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateForm = () => {
    // Mark all fields as touched to show errors
    const allTouched = {
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      role: true
    };
    setTouched(allTouched);

    // Validate all fields
    const fields = ["name", "email", "password", "confirmPassword"];
    let isValid = true;

    fields.forEach(field => {
      if (!validateField(field, form[field])) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) return;

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok) {
        toast.success("Signup successful 🎉", { duration: 3000 });
        
        // Reset form
        setForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "customer"
        });
        setTouched({});
        setErrors({});

        setTimeout(() => {
          router.push("/login");
        }, 1000);
      } else {
        // Handle specific error cases
        switch (res.status) {
          case 409:
            toast.error("Email already exists. Please use a different email.");
            break;
          case 400:
            toast.error(data.message || "Invalid input data");
            break;
          case 422:
            toast.error("Password does not meet security requirements");
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error(data.message || "Signup failed ❌", { duration: 3000 });
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.error("Request timeout. Please try again.");
      } else {
        console.error("Signup error:", error);
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength.level) return "bg-gray-200";
    
    switch (passwordStrength.level) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-blue-500";
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const isFormValid = () => {
    return Object.keys(errors).length === 0 && 
           form.name && 
           form.email && 
           form.password && 
           form.confirmPassword &&
           form.password === form.confirmPassword;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-[#de5422] mb-6">
          <span className="text-gray-900">Create an</span> Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block font-medium text-gray-700">Name</label>
            <input
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-1 ${
                errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#de5422]"
              }`}
              required
              maxLength={50}
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-1 ${
                errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#de5422]"
              }`}
              required
              maxLength={100}
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-1 ${
                errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#de5422]"
              }`}
              required
              minLength={8}
              maxLength={100}
            />
            
            {/* Password Strength Indicator */}
            {form.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    Strength: <span className={`font-semibold ${
                      passwordStrength.level >= 4 ? "text-green-600" : 
                      passwordStrength.level >= 3 ? "text-blue-600" : 
                      passwordStrength.level >= 2 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength.level / 5) * 100}%` }}
                  ></div>
                </div>
                {passwordStrength.message && (
                  <p className="mt-1 text-xs text-gray-500">{passwordStrength.message}</p>
                )}
              </div>
            )}
            
            {errors.password && touched.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-1 ${
                errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#de5422]"
              }`}
              required
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>


          {/* Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full bg-[#de5422] text-white py-3 rounded-lg font-semibold hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-700">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-[#de5422] hover:underline cursor-pointer font-medium"
          >
            Login
          </span>
        </p>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 text-center">
            🔒 Your data is securely encrypted. We never share your personal information.
          </p>
        </div>
      </div>
    </div>
  );
}