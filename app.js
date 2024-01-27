import express from "express";
import cors from "cors";

import connectDB from "./utilities/connectDb.js";
import universityRoute from "./routes/university.route.js";
import studentRoute from "./routes/student.route.js";
import utilityRoute from "./routes/utility.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/university", universityRoute);
app.use("/student", studentRoute);
app.use("/utility", utilityRoute);

connectDB(app);
