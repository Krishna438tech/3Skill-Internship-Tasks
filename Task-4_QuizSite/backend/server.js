const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/team", require("./routes/teamRoutes"));
app.use("/api/quiz", require("./routes/quizRoutes"));
app.use("/api/result", require("./routes/resultRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "QuizHub Backend Running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on Port ${PORT}`);
});