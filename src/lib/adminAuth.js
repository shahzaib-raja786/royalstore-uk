import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

/**
 * Middleware to verify admin authentication
 * @returns {Promise<{authenticated: boolean, user?: object, error?: string}>}
 */
export async function verifyAdminAuth() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return { authenticated: false, error: "No token provided" };
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user has admin role
        if (decoded.role !== "admin") {
            return { authenticated: false, error: "Insufficient permissions" };
        }

        return { authenticated: true, user: decoded };
    } catch (error) {
        return { authenticated: false, error: error.message };
    }
}
