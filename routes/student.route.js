import express from "express";

import Student from "../schemas/student.model.js";
import StudentFeedback from "../schemas/studentFeedback.model.js";
import authenticateStudent from "../middlewares/authenticateStudent.js";
import getCourseEvaluationAspects from "../utilities/getCourseEvaluationAspects.js";
import CourseFeedbackForm from "../schemas/courseFeedbackForm.model.js";
import University from "../schemas/university.model.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const {
      matriculationNumber,
      universityId,
      name,
      level,
      email,
      department,
      authId,
    } = req.body;
    const emailHasBeenUsed = await Student.findOne({ email });
    if (emailHasBeenUsed) {
      return res.status(409).json({
        message: "A student has been registered with this same email address",
      });
    }
    const authIdExists = await Student.findOne({ authId });
    if (authIdExists) {
      return res.status(409).json({
        message:
          "A student has been registered with this same authentication id",
      });
    }
    const matriculationNumberExists = await Student.findOne({
      matriculationNumber,
    });
    if (matriculationNumberExists) {
      return res.status(409).json({
        message: "A student already exists with this same matriculation number",
      });
    }
    const authIdExistsInUniversity = await University.findOne({ authId });
    if (authIdExistsInUniversity) {
      return res.status(404).json({
        message:
          "The authentication id is already associated with a University",
      });
    }
    const student = new Student({
      matriculationNumber,
      universityId,
      name,
      level,
      email,
      department,
      authId,
    });
    await student.save();
    res.status(201).json({
      response: "You've Successfully Been Registered",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: `Internal Server Error ${error.message}`,
    });
  }
});

router.get("/check-auth-id/:authId", async (req, res) => {
  try {
    const { authId } = req.params;

    const authIdExists = await Student.findOne({ authId });

    if (authIdExists) {
      return res.status(200).json({
        exists: true,
        message: "Authentication id already exists in the Student model",
      });
    } else {
      return res.status(200).json({
        exists: false,
        message: "Authentication id does not exist in the Student model",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/forms", authenticateStudent, async (req, res) => {
  try {
    const { matriculationNumber } = req.authenticatedStudent;
    const status = req.query.status; // "submitted" or "unsubmitted"
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    const feedbacks = await StudentFeedback.find({
      matriculationNumber,
    }).sort({ createdAt: -1 });

    const allCourseFeedbackForms = await CourseFeedbackForm.find({
      formIsActive: true,
    }).sort({ createdAt: -1 });

    const submittedCourseFeedbackFormIds = feedbacks.map((feedback) => {
      return feedback.courseFeedbackFormId.toString();
    });

    if (status === "submitted") {
      const submittedCourseFeedbackForms = await Promise.all(
        submittedCourseFeedbackFormIds.map(async (courseFormId) => {
          return await CourseFeedbackForm.findById(courseFormId);
        })
      );

      const totalPages = Math.ceil(
        submittedCourseFeedbackForms.length / pageSize
      );

      if (submittedCourseFeedbackForms.length === 0) {
        return res.status(404).json({
          message: "No submitted forms found.",
        });
      }

      res.json({
        submittedForms: submittedCourseFeedbackForms.slice(
          (page - 1) * pageSize,
          page * pageSize
        ),
        totalPages,
        currentPage: page,
      });
    } else if (status === "unsubmitted") {
      // Filter out submitted forms
      const unsubmittedCourseFeedbackForms = allCourseFeedbackForms.filter(
        (form) => !submittedCourseFeedbackFormIds.includes(form._id.toString())
      );

      const totalPages = Math.ceil(
        unsubmittedCourseFeedbackForms.length / pageSize
      );

      if (unsubmittedCourseFeedbackForms.length === 0) {
        return res.status(404).json({
          message: "No unsubmitted forms found.",
        });
      }

      res.json({
        unsubmittedForms: unsubmittedCourseFeedbackForms.slice(
          (page - 1) * pageSize,
          page * pageSize
        ),
        totalPages,
        currentPage: page,
      });
    } else {
      res.status(400).json({
        message: "Invalid status parameter. Use 'submitted' or 'unsubmitted'.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
});

router.post(
  "/submit-review/:courseFeedbackFormID",
  authenticateStudent,
  async (req, res) => {
    try {
      const authenticatedStudent = req.authenticatedStudent;
      const { matriculationNumber } = authenticatedStudent;
      const { courseFeedbackFormID } = req.params;
      const { evaluationComment } = req.body;
      const existingFeedback = await StudentFeedback.findOne({
        matriculationNumber,
        courseFeedbackFormId: courseFeedbackFormID,
      });
      if (existingFeedback) {
        return res
          .status(400)
          .json({ message: "Review already submitted for this form" });
      }
      const courseFeedbackForm = await CourseFeedbackForm.findById(
        courseFeedbackFormID
      );
      if (!courseFeedbackForm) {
        return res
          .status(404)
          .json({ message: "Course feedback form not found" });
      }
      const aspectBasedEvaluation = await getCourseEvaluationAspects(
        evaluationComment
      );
      const newFeedback = new StudentFeedback({
        matriculationNumber,
        evaluationComment,
        evaluationAspect: aspectBasedEvaluation,
        courseFeedbackFormId: courseFeedbackFormID,
      });
      const review = await newFeedback.save();
      courseFeedbackForm.numberOfSubmissions += 1;
      await courseFeedbackForm.save();
      res.status(201).json({
        message: "Review submitted successfully",
        review,
        newFeedback,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.put("/update-level", authenticateStudent, async (req, res) => {
  try {
    const authenticatedStudent = req.authenticatedStudent;
    const { newLevel } = req.body;
    authenticatedStudent.level = newLevel;
    await authenticatedStudent.save();
    res.status(200).json({ message: "Student level updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
