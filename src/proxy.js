import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export default function proxy(req) {
  if (req.nextUrl.pathname.startsWith("/api/cart") || req.nextUrl.pathname.startsWith("/api/order") || req.nextUrl.pathname.startsWith("/api/user") || req.nextUrl.pathname.startsWith("/api/admin") || req.nextUrl.pathname.startsWith("/api/review")) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // user id inject
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", decoded.payload.id);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/cart/:path*",
    "/api/order/:path*", 
    "/api/user/:path*",
    "/api/admin/:path*",
    "/api/review/:path*"
  ],
};