import jwt from "jsonwebtoken";

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRET env me hona chahiye
  } catch (error) {
    return null;
  }
}

export const authService = {
  login: async (email, password) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Network error" }));
        
        switch (res.status) {
          case 401:
            throw new Error(errorData.message || "Invalid password");
          case 404:
            throw new Error(errorData.message || "Email not found");
          case 403:
            throw new Error("Account suspended or inactive");
          default:
            throw new Error(errorData.message || "Login failed");
        }
      }

      const data = await res.json();
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error("Request timeout. Please try again.");
      } else {
        throw new Error("Network error. Please check your connection.");
      }
    }
  },

  logout: async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      return true;
    } catch (e) {
      throw new Error("Logout failed");
    }
  },

  checkAuth: async () => {
    try {
      const res = await fetch("/api/check-auth", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      return {
        isAuthenticated: data.authenticated === true,
        user: data.user,
        isAdmin: data.user?.role === "admin"
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        user: null,
        isAdmin: false
      };
    }
  }
};