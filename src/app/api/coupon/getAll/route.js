import {connectDB} from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function GET(req) {
  await connectDB();

  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }); // latest first
    return new Response(
      JSON.stringify({ success: true, coupons }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Failed to fetch coupons", error: error.message }),
      { status: 500 }
    );
  }
}
