import Student from "../schemas/student.model.js";

const authenticateStudent = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Extract the token part (excluding "Bearer ")
  const token = authorizationHeader.split(" ")[1];
  try {
    const student = await Student.findOne({ authId: token });
    if (!student) {
      // User not found in the database, handle accordingly
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Attach the student to the request for further processing
    req.authenticatedStudent = student;
    next();
  } catch (error) {
    // Handle database errors
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default authenticateStudent;
