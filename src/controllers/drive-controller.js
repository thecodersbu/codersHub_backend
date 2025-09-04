import { uploadFileToDrive, listFilesFromDrive, deleteFileFromDrive } from "../services/drive-service.js";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    console.log("Folder ID:", process.env.GOOGLE_DRIVE_FOLDER_ID);
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;
    const fileData = await uploadFileToDrive(req.file, folderId);
    res.json({
      success: true,
      fileId: fileData.id,
      fileName: fileData.name,
      viewLink: fileData.webViewLink,
      downloadLink: fileData.webContentLink,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

export const listFiles = async (req, res) => {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;
    const files = await listFilesFromDrive(folderId);
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ error: "Failed to list files" });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteFileFromDrive(id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete file" });
  }
};
