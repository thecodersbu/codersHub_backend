import express from "express";
import dotenv from "dotenv";
import driverouter from "./routes/driveroute.js"; 
dotenv.config();
const app = express();
app.use(express.json());
// Routes
app.use("/drive", driverouter);
export default app;