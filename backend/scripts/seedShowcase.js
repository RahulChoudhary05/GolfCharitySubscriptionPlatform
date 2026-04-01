require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { seedShowcaseData } = require("../utils/showcaseSeeder");

const run = async () => {
  try {
    await connectDB();
    const reset = process.argv.includes("--reset");
    const result = await seedShowcaseData({ reset });
    console.log("Showcase data seeded successfully");
    console.log(JSON.stringify(result, null, 2));
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed showcase data:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

run();
