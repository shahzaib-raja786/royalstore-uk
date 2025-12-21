import Category from "@/models/Category";
import { connectDB } from "@/lib/db";

// ✅ Update Category
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    // Ensure subcategories are included if present
    const updateData = {
      name: body.name,
      image: body.image,
      subcategories: body.subcategories || []
    };

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });
    return Response.json(updatedCategory, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

// ✅ Delete Category
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    await Category.findByIdAndDelete(id);
    return Response.json({ message: "Category deleted" }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
