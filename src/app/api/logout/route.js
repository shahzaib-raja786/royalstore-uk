import { cookies } from "next/headers";

export async function POST() {
  try {
    // Token cookie ko clear kar do
    const cookieStore = await cookies();
    cookieStore.set("token", "", { maxAge: 0 });

    return new Response(
      JSON.stringify({ message: "Logout successful" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error logging out" }),
      { status: 500 }
    );
  }
}
