import mongoose from "mongoose";

// Connects to MongoDB using the MONGODB_URI from the environment.
// Returns the mongoose connection so callers can await it before serving requests.
const connection = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("mongodb connected successfully ->", conn.connection.host);
    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Fail fast so the server does not run without a database.
    process.exit(1);
  }
};

export default connection;