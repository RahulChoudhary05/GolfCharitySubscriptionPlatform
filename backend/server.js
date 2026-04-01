require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
const isDemoMode = process.env.DEMO_MODE === "true";

app.get("/", (req, res) => res.json({ message: "Golf Charity API running" }));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/scores", require("./routes/scoreRoutes"));
app.use("/api/charities", require("./routes/charityRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/draws", require("./routes/drawRoutes"));
app.use("/api/winners", require("./routes/winnerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (isDemoMode) {
  app.listen(PORT, () => console.log(`Server on ${PORT} (DEMO_MODE without database)`));
} else {
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Server on ${PORT}`)))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
