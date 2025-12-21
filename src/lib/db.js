import mongoose from "mongoose";

let isConnected = false; // global state

export const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB already connected ✅");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "royalstore", // apna db name
    });

    isConnected = true;
    console.log("MongoDB connected ✅", conn.connection.host);
  } catch (error) {
    console.error("MongoDB connection failed ❌", error);
    throw new Error("DB connection error");
  }
};

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("MongoDB disconnected ✅");
  }
};
