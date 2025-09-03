import fs from "fs";
import drive from "../googledrive.js";

export const uploadFileToDrive = async (file, folderId) => {
  if (!folderId) {
    throw new Error("Google Drive folder ID is required for uploads.");
  }
  const fileMetadata = {
    name: file.originalname,
    parents: [folderId], // ✅ always inside shared folder
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, name, webViewLink, webContentLink",
  });

  // ✅ Make uploaded file public
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: { role: "reader", type: "anyone" },
  });

  fs.unlinkSync(file.path); // ✅ clean up temp file

  return response.data;
};

export const listFilesFromDrive = async (folderId) => {
  if (!folderId) {
    throw new Error("Google Drive folder ID is required for listing.");
  }

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`, // ✅ only list from folder
    fields: "files(id, name, mimeType, webViewLink)",
    pageSize: 20,
  });

  return response.data.files;
};

export const deleteFileFromDrive = async (fileId) => {
  await drive.files.delete({ fileId });
  return { success: true, fileId };
};