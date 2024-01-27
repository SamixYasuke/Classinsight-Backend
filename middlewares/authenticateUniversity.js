import University from "../schemas/university.model.js";

const authenticateUniversity = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract the token part (excluding "Bearer ")
  const token = authorizationHeader.split(" ")[1];

  try {
    const university = await University.findOne({ authId: token });

    if (!university) {
      // User not found in the database, handle accordingly
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach the university to the request for further processing
    req.authenticatedUniversity = university;
    next();
  } catch (error) {
    // Handle database errors
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default authenticateUniversity;
