// app/api/ticker/route.js
import { connectDB } from "@/lib/db";
import Ticker from "@/models/Ticker";

export async function GET() {
  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("Connected to DB successfully");
    
    console.log("Fetching tickers...");
    const data = await Ticker.find().sort({ createdAt: -1 });
    console.log("Tickers fetched:", data ? data.length : 0);
    
    return Response.json(data || []);  // agar null hai to [] bhejo
  } catch (error) {
    console.error("Ticker fetch error:", error);
    return Response.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("Connected to DB successfully");
    
    const body = await req.json();
    console.log("Received ticker data:", body);
    
    console.log("Creating new ticker...");
    const newTicker = new Ticker(body);
    await newTicker.save();
    console.log("Ticker created:", newTicker._id);
    
    return Response.json(newTicker, { status: 201 });
  } catch (error) {
    console.error("Ticker create error:", error);
    return Response.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}