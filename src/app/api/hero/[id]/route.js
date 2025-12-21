import { connectDB } from "@/lib/db";
import HeroImage from "@/models/Hero";

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } =await params;

    const deletedImage = await HeroImage.findByIdAndDelete(id);

    if (!deletedImage) {
      return Response.json({ message: "Image not found" }, { status: 404 });
    }

    return Response.json({ message: "Image deleted successfully" });
  } catch (error) {
    return Response.json(
      { message: "Error deleting image", error: error.message },
      { status: 500 }
    );
  }
}
