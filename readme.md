# CodersHub Backend

CodersHub - Centralized. Accessible. Efficient. Academic Excellence Made Simple.

## 🚀 Features Fixed & Implemented

### ✅ Issues Resolved:
1. **MongoDB Integration**: Replaced mock database with actual MongoDB using Mongoose
2. **Cloudinary URL/ID Storage**: After uploading to Cloudinary, URLs and IDs are now properly stored in MongoDB
3. **Separate Resource Type Routes**: Created dedicated routes for different resource types
4. **Text-based Resources**: Syllabus and Content Link uploads now work without file uploads

### 🔧 New Route Structure:

#### File Upload Routes (require PDF files):
- `POST /api/v1/resources/upload/pyq` - Upload Previous Year Questions
- `POST /api/v1/resources/upload/notes` - Upload Notes

#### Text-based Routes (no file upload):
- `POST /api/v1/resources/upload/syllabus` - Upload Syllabus (text content)
- `POST /api/v1/resources/upload/content` - Upload Content Links (URLs)

#### General Routes:
- `GET /api/v1/resources/get-resources` - Get all resources with filtering
- `GET /api/v1/resources/search` - Search resources
- `GET /api/v1/resources/resource/:id` - Get specific resource
- `GET /api/v1/resources/resource/:id/download` - Download/access resource
- `DELETE /api/v1/resources/resource/:id` - Delete resource
- `DELETE /api/v1/resources/bulk-delete` - Bulk delete resources
- `GET /api/v1/resources/resource/stats/overview` - Get statistics
- `GET /api/v1/resources/resource/meta/branches` - Get available branches
- `GET /api/v1/resources/resource/meta/subjects` - Get available subjects

## 📋 API Documentation

### 1. Upload PYQ (Previous Year Questions)
```bash
POST /api/v1/resources/upload/pyq
Content-Type: multipart/form-data

# Form Data:
file: [PDF file]
branch: "CSE"
semester: 5
subject: "Software Engineering"
title: "SE Mid-term 2023"
description: "Mid-term examination paper"
tags: "midterm,2023,software"
```

### 2. Upload Notes
```bash
POST /api/v1/resources/upload/notes
Content-Type: multipart/form-data

# Form Data:
file: [PDF file]
branch: "CSE"
semester: 5
subject: "Software Engineering"
title: "SE Complete Notes"
description: "Comprehensive notes for SE"
tags: "notes,complete,software"
```

### 3. Upload Syllabus (Text-based)
```bash
POST /api/v1/resources/upload/syllabus
Content-Type: application/json

{
  "branch": "CSE",
  "semester": 5,
  "subject": "Software Engineering",
  "title": "SE Syllabus 2024",
  "description": "Complete syllabus",
  "syllabusText": "Unit 1: Introduction\nUnit 2: Requirements\nUnit 3: Design...",
  "tags": "syllabus,2024"
}
```

### 4. Upload Content Link (URL-based)
```bash
POST /api/v1/resources/upload/content
Content-Type: application/json

{
  "branch": "CSE",
  "semester": 5,
  "subject": "Software Engineering",
  "title": "SE Video Lectures",
  "description": "YouTube playlist",
  "contentLink": "https://www.youtube.com/playlist?list=...",
  "tags": "video,lectures"
}
```

### 5. Get Resources with Filtering
```bash
GET /api/v1/resources/get-resources?branch=CSE&semester=5&resourceType=notes&page=1&limit=20
```

### 6. Search Resources
```bash
GET /api/v1/resources/search?q=software&branch=CSE&semester=5
```

### 7. Download/Access Resource
```bash
GET /api/v1/resources/resource/:id/download
```

Response varies by resource type:
- **PYQ/Notes**: Returns download URL for PDF
- **Syllabus**: Returns syllabus text content
- **Content**: Returns the external link URL

## 🗂️ Resource Types

| Type | Description | Upload Method | Storage |
|------|-------------|---------------|---------|
| `pyq` | Previous Year Questions | File upload (PDF) | Cloudinary + MongoDB |
| `notes` | Study Notes | File upload (PDF) | Cloudinary + MongoDB |
| `syllabus` | Course Syllabus | Text input | MongoDB only |
| `content` | External Links | URL input | MongoDB only |

## 🏛️ Supported Branches

- CSE - Computer Science and Engineering
- ECE - Electronics and Communication Engineering  
- ME - Mechanical Engineering
- BT - Biotechnology
- BM - Biomedical Engineering
- FT - Food Technology
- EIE - Electronics and Instrumentation Engineering
- IT - Information Technology

## 🔧 Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/codershub

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=campushub-resources

# Server
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## 🚀 Getting Started

1. **Install Dependencies**
```bash
npm install
```

2. **Set Environment Variables**
Create `.env` file with required variables (see `.env.example`)

3. **Start Development Server**
```bash
npm run dev
```

4. **Test the API**
```bash
node test-api.js
```

## 📊 Database Schema

### Resource Model
```javascript
{
  branch: String,           // Required: CSE, ECE, ME, etc.
  semester: Number,         // Required: 1-8
  subject: String,          // Required: Subject name
  resourceType: String,     // Required: pyq, notes, syllabus, content
  title: String,            // Required: Resource title
  description: String,      // Optional: Description
  
  // File-based resources (pyq, notes)
  fileUrl: String,          // Cloudinary URL
  fileId: String,           // Cloudinary public ID
  fileName: String,         // Original filename
  fileSize: Number,         // File size in bytes
  
  // Text-based resources
  syllabusText: String,     // For syllabus type
  contentLink: String,      // For content type
  
  // Common fields
  tags: [String],           // Optional: Tags array
  uploadedBy: String,       // Default: "admin"
  downloadCount: Number,    // Default: 0
  isActive: Boolean,        // Default: true
  createdAt: Date,          // Auto-generated
  updatedAt: Date           // Auto-generated
}
```

## 🔍 Key Improvements

1. **Proper MongoDB Integration**: All data now persists in MongoDB
2. **Cloudinary Integration**: File URLs and IDs are stored after successful upload
3. **Resource Type Separation**: Different routes for different resource types
4. **Text-based Resources**: Syllabus and content links work without file uploads
5. **Better Error Handling**: Comprehensive error handling and logging
6. **Production Ready**: Proper validation, logging, and error handling

## 🧪 Testing

The `test-api.js` file provides basic API testing. Run it after starting the server:

```bash
npm run dev
# In another terminal:
node test-api.js
```

This will test all major endpoints and verify the functionality.
