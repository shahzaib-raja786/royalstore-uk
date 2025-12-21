import {connectDB} from "@/lib/db";
import HeroImage from "@/models/Hero";

export async function GET() {
  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("Connected to DB successfully");
    
    console.log("Fetching hero images...");
    const images = await HeroImage.find({});
    console.log("Hero images fetched:", images.length);
    
    return Response.json(images);
  } catch (error) {
    console.error("Error fetching hero images:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("Connected to DB successfully");
    
    const body = await req.json();
    console.log("Received hero image data:", body);
    
    console.log("Creating new hero image...");
    const newImage = await HeroImage.create(body);
    console.log("Hero image created:", newImage._id);
    
    return Response.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Error creating hero image:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}