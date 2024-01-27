import mongoose from "mongoose";

const { Schema, model } = mongoose;

const courseFeedbackFormSchema = new Schema(
  {
    courseCode: {
      type: String,
      required: true,
    },
    lecturerName: {
      type: String,
      required: true,
    },
    universityId: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    numberOfSubmissions: {
      type: Number,
      default: 0,
    },
    formIsActive: {
      type: Boolean,
      enum: [true, false],
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const CourseFeedbackForm = model(
  "CourseFeedbackForm",
  courseFeedbackFormSchema
);

export default CourseFeedbackForm;
