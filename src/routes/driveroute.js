import express from "express";
import multer from "multer";
import { uploadFile, listFiles, deleteFile } from "../controllers/drive-controller.js"; // 👈 use camelCase name

const driverouter = express.Router();
const upload = multer({ dest: "uploads/" });

driverouter.post("/upload", upload.single("file"), uploadFile);
driverouter.get("/files", listFiles);
driverouter.delete("/files/:id", deleteFile);

export default driverouter;
