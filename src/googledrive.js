// src/google-drive.js
import { google } from "googleapis";
import path from "path";
const KEYFILEPATH = path.join(process.cwd(), "service-account.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

// authenticate with service account
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});
// create Google Drive client
const drive = google.drive({ version: "v3", auth });

export default drive;