import mongoose from "mongoose";

// Set the strictQuery option to avoid the deprecation warning
mongoose.set('strictQuery', true); // or false, depending on your preference

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Successfully connected to MongoDB 👍`);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
