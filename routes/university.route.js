import express from "express";

import University from "../schemas/university.model.js";
import authenticateUniversity from "../middlewares/authenticateUniversity.js";
import CourseFeedbackForm from "../schemas/courseFeedbackForm.model.js";
import StudentFeedback from "../schemas/studentFeedback.model.js";
import Student from "../schemas/student.model.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, location, departments, authId } = req.body;
    const universityHasBeenRegistered = await University.findOne({ authId });
    if (universityHasBeenRegistered) {
      return res.status(409).json({
        message:
          "A university has been registered with this same authentication id",
      });
    }
    const emailHasBeenUsed = await University.findOne({ email });
    if (emailHasBeenUsed) {
      return res.status(409).json({
        message:
          "A university has been registered with this same email address",
      });
    }
    const authIdExistsInStudent = await Student.findOne({ authId });
    if (authIdExistsInStudent) {
      return res.status(409).json({
        message: "The authentication id is already associated with a student",
      });
    }
    const university = new University({
      name,
      email,
      location,
      departments,
      authId,
    });
    await university.save();
    res.status(201).json({
      response: "You've Successfully Been Registered",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

router.get("/check-auth-id/:authId", async (req, res) => {
  try {
    const { authId } = req.params;
    const authIdExists = await University.findOne({ authId });
    if (authIdExists) {
      return res.status(200).json({
        exists: true,
        message: "Authentication id already exists in the University model",
      });
    } else {
      return res.status(200).json({
        exists: false,
        message: "Authentication id does not exist in the University model",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/create-form", authenticateUniversity, async (req, res) => {
  try {
    const { courseCode, lecturerName, level, department } = req.body;
    const authenticatedUniversity = req.authenticatedUniversity;
    const newForm = new CourseFeedbackForm({
      courseCode,
      lecturerName,
      universityId: authenticatedUniversity._id,
      level,
      department,
    });
    await newForm.save();
    res
      .status(201)
      .json({ message: "Course feedback form created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/all-feedback-forms", authenticateUniversity, async (req, res) => {
  try {
    const authenticatedUniversity = req.authenticatedUniversity;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const skip = (page - 1) * pageSize;

    // Sort forms based on creation date in descending order
    const forms = await CourseFeedbackForm.find(
      { universityId: authenticatedUniversity._id },
      "_id courseCode createdAt lecturerName formIsActive"
    ).sort({ createdAt: -1 });

    const totalItems = forms.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Retrieve paginated forms with sorting
    const paginatedForms = await CourseFeedbackForm.find(
      { universityId: authenticatedUniversity._id },
      "_id courseCode createdAt lecturerName formIsActive"
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const dateRange = {
      startDate: paginatedForms.length > 0 ? paginatedForms[0].createdAt : null,
      endDate:
        paginatedForms.length > 0
          ? paginatedForms[paginatedForms.length - 1].createdAt
          : null,
    };

    res.json({
      forms: paginatedForms,
      dateRange,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get(
  "/feedback-form/:formId",
  authenticateUniversity,
  async (req, res) => {
    try {
      const authenticatedUniversity = req.authenticatedUniversity;
      const { formId } = req.params;

      const form = await CourseFeedbackForm.findById(formId);

      if (
        !form ||
        String(form.universityId) !== String(authenticatedUniversity._id)
      ) {
        return res.status(403).json({
          message:
            "Access forbidden. The university does not have permission to access this form.",
        });
      }

      const formDetails = {
        _id: form._id,
        courseCode: form.courseCode,
        lecturerName: form.lecturerName,
        level: form.level,
        department: form.department,
        createdAt: form.createdAt,
        formIsActive: form.formIsActive,
        // Add other fields you want to include in the response
      };

      res.status(200).json({
        formDetails,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.delete(
  "/delete-form/:formId",
  authenticateUniversity,
  async (req, res) => {
    try {
      const formId = req.params.formId;
      const authenticatedUniversity = req.authenticatedUniversity;

      const formToDelete = await CourseFeedbackForm.findOne({
        _id: formId,
        universityId: authenticatedUniversity._id,
      });

      if (!formToDelete) {
        return res
          .status(404)
          .json({ message: "Form not found or unauthorized" });
      }

      // Delete all associated student feedbacks
      await StudentFeedback.deleteMany({ courseFeedbackFormId: formId });
      await CourseFeedbackForm.findByIdAndDelete(formId);
      res
        .status(200)
        .json({ message: "Course feedback form deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: `Internal Server Error: ${error.message}` });
    }
  }
);

router.put("/update-form/:formId", authenticateUniversity, async (req, res) => {
  try {
    const formId = req.params.formId;
    const authenticatedUniversity = req.authenticatedUniversity;
    const formToUpdate = await CourseFeedbackForm.findOne({
      _id: formId,
      universityId: authenticatedUniversity._id,
    });
    if (!formToUpdate) {
      return res
        .status(404)
        .json({ message: "Form not found or unauthorized" });
    }
    const { courseCode, lecturerName, level, department } = req.body;
    if (courseCode) formToUpdate.courseCode = courseCode;
    if (lecturerName) formToUpdate.lecturerName = lecturerName;
    if (level) formToUpdate.level = level;
    if (department) formToUpdate.department = department;
    await formToUpdate.save();
    res
      .status(201)
      .json({ message: "Course feedback form updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put(
  "/toggle-visibility/:formId",
  authenticateUniversity,
  async (req, res) => {
    try {
      const formId = req.params.formId;
      const authenticatedUniversity = req.authenticatedUniversity;
      const formToToggle = await CourseFeedbackForm.findOne({
        _id: formId,
        universityId: authenticatedUniversity._id,
      });
      if (!formToToggle) {
        return res
          .status(404)
          .json({ message: "Form not found or unauthorized" });
      }
      formToToggle.formIsActive = !formToToggle.formIsActive;
      await formToToggle.save();
      res.status(200).json({
        message: "Visibility setting toggled successfully",
        formIsActive: formToToggle.formIsActive,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get(
  "/evaluation-feedbacks/:courseFeedbackID",
  authenticateUniversity,
  async (req, res) => {
    try {
      const authenticatedUniversity = req.authenticatedUniversity;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 5;
      const { courseFeedbackID } = req.params;

      const feedbackExists = await StudentFeedback.exists({
        courseFeedbackFormId: courseFeedbackID,
      });

      if (!feedbackExists) {
        return res.status(404).json({
          message:
            "No evaluation feedbacks found for the provided courseFeedbackID.",
        });
      }

      const form = await CourseFeedbackForm.findById(courseFeedbackID);

      if (
        !form ||
        String(form.universityId) !== String(authenticatedUniversity._id)
      ) {
        return res.status(403).json({
          message:
            "Access forbidden. The university does not have permission to access this form.",
        });
      }

      const feedbackCount = await StudentFeedback.countDocuments({
        courseFeedbackFormId: courseFeedbackID,
      });

      const totalPages = Math.ceil(feedbackCount / pageSize);
      const skip = (page - 1) * pageSize;

      const allFeedbacks = await StudentFeedback.find({
        courseFeedbackFormId: courseFeedbackID,
      });

      const evaluationFeedbacks = await StudentFeedback.find(
        { courseFeedbackFormId: courseFeedbackID },
        "_id matriculationNumber evaluationAspect courseFeedbackFormId createdAt"
      )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);

      const dateRange = {
        startDate: form ? form.createdAt : null,
        endDate: form ? form.createdAt : null,
      };

      res.status(200).json({
        allFeedbacks,
        evaluationFeedbacks,
        totalPages,
        currentPage: page,
        dateRange,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get(
  "/student-feedback/:feedbackId",
  authenticateUniversity,
  async (req, res) => {
    try {
      const { feedbackId } = req.params;
      const studentFeedback = await StudentFeedback.findById(feedbackId);
      if (!studentFeedback) {
        return res.status(404).json({ message: "Student feedback not found" });
      }
      res.status(200).json({ studentFeedback });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// university utilities route
router.get("/universities", async (req, res) => {
  try {
    const universities = await University.find({}, "_id name");

    if (universities.length === 0) {
      return res.status(404).json({
        message: "No universities found",
      });
    }

    return res.status(200).json({
      universities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/universities/:universityId/departments", async (req, res) => {
  try {
    const { universityId } = req.params;
    const university = await University.findById(universityId, "departments");
    if (!university) {
      return res.status(404).json({
        message: "University not found",
      });
    }
    return res.status(200).json({
      departments: university.departments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
