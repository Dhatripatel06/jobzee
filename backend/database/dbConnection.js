import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "MERN_STACK_JOB_SEEKING",
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    })
    .then(() => {
      console.log("Connected to database successfully!");
    })
    .catch((err) => {
      console.log(`Database connection error: ${err}`);
      console.log("Please check your MongoDB URI and network connection.");
    });
};