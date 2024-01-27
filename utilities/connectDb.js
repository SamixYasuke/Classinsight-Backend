import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (app) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    app.listen(process.env.PORT, () => {
      console.log(
        `App is running on port ${process.env.PORT} and url http://localhost:${process.env.PORT}`
      );
      console.log(`Database has connected successfully`);
    });
  } catch (error) {
    console.error(`Error Connecting to the Server: ${error}`);
  }
};

export default connectDB;
