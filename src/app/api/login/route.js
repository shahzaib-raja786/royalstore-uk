import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ message: "Email not found" }), { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ message: "Invalid password" }), { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Save token in cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, { httpOnly: true, maxAge: 60 * 60 * 24 });
    return new Response(
      JSON.stringify({ message: "Login successful", token, role: user.role }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error logging in" }), { status: 500 });
  }
}
