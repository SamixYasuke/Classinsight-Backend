import express from "express";

import Student from "../schemas/student.model.js";
import University from "../schemas/university.model.js";

const router = express.Router();

router.get("/profile/:authId", async (req, res) => {
  try {
    const { authId } = req.params;

    // Check in the Student model
    const student = await Student.findOne({ authId });
    if (student) {
      return res.status(200).json({
        type: "student",
        profile: student,
      });
    }

    // Check in the University model
    const university = await University.findOne({ authId });
    if (university) {
      return res.status(200).json({
        type: "university",
        profile: university,
      });
    }

    // If not found in both models
    return res.status(404).json({
      message: "Profile not found",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
