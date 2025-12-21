import Product from "@/models/Product";
import { connectDB } from "@/lib/db";

// 🟢 Get All Products (with optional search)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" }; // case-insensitive search
    }

    const products = await Product.find(query).populate("category");
    return Response.json(products, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// 🟢 Add Product


export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // validate required fields
    if (!body.name || !body.basePrice) {
      return Response.json({ error: "Name & basePrice are required" }, { status: 400 });
    }

    // format images
    const images = Array.isArray(body.images)
      ? body.images
      : (body.images || "").split(",").map((img) => img.trim()).filter(Boolean);

    // format customizations
    const customizations = Array.isArray(body.customizations)
      ? body.customizations.map((c) => ({
        type: c.type,
        label: c.label,
        required: c.required || false,
        options: Array.isArray(c.options)
          ? c.options.map((o) => ({
            label: o.label,
            price: o.price || 0,
          }))
          : [],
      }))
      : [];

    const product = new Product({
      name: body.name,
      description: body.description || "",
      basePrice: Number(body.basePrice),
      discount: Number(body.discount) || 0,
      thumbnail: body.thumbnail || (images.length > 0 ? images[0] : ""),
      images,
      category: body.category || null,
      subcategory: body.subcategory || null,
      customizations,
    });

    await product.save();

    return Response.json(product, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

