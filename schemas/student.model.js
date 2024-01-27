import mongoose from "mongoose";

const { Schema, model } = mongoose;

const studentSchema = new Schema({
  matriculationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  universityId: {
    type: Schema.Types.ObjectId,
    ref: "University",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  authId: {
    type: String,
    required: true,
  },
});

const Student = model("Student", studentSchema);

export default Student;
