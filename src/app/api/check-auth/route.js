import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    // ✅ async call
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ authenticated: false }),
        { status: 200 }
      );
    }

    // ✅ verify token with JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return new Response(
      JSON.stringify({ authenticated: true, user: decoded }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ authenticated: false, error: err.message }),
      { status: 200 }
    );
  }
}
