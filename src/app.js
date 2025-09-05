import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import resourceRouter from "./routes/resourceRoutes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.FRONTEND_URL?.split(",") || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/resources", resourceRouter);

app.get("/", (req, res) => {
    res.send("hello world");
});

export default app;
