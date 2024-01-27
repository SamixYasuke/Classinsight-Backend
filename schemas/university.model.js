import mongoose from "mongoose";

const { Schema, model } = mongoose;

const universitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  departments: [
    {
      type: String,
    },
  ],
  authId: {
    type: String,
    required: true,
  },
});

const University = model("University", universitySchema);

export default University;
