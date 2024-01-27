import mongoose from "mongoose";

const { Schema, model } = mongoose;

const studentFeedbackSchema = new Schema(
  {
    matriculationNumber: {
      type: String,
      required: true,
    },
    evaluationComment: {
      type: String,
      required: true,
    },
    evaluationAspect: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    courseFeedbackFormId: {
      type: Schema.Types.ObjectId,
      ref: "CourseFeedbackForm",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const StudentFeedback = model("StudentFeedback", studentFeedbackSchema);

export default StudentFeedback;
