import Category from "@/models/Category";
import { connectDB } from "@/lib/db";

// Get All Categories
export async function GET() {
  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("Connected to DB successfully");
    
    console.log("Fetching categories...");
    const categories = await Category.find().sort({ createdAt: -1 }); // latest first
    console.log("Categories fetched:", categories.length);

    return Response.json(
      { success: true, data: categories },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


// ✅ Add Category
export async function POST(req) {
  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("Connected to DB successfully");
    
    const body = await req.json();
    console.log("Received category data:", body);

    // Ensure subcategories are included if present
    const categoryData = {
      name: body.name,
      image: body.image,
      subcategories: body.subcategories || []
    };

    const category = new Category(categoryData);
    console.log("Saving category...");
    await category.save();
    console.log("Category saved:", category._id);
    
    return Response.json(category, { status: 201 });
  } catch (error) {
    console.error("Error saving category:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}