import express from "express";
import {
    uploadPYQ,
    uploadNotes,
    uploadSyllabus,
    uploadContentLink,
    getResources,
    getResourceById,
    downloadResource,
    deleteResource,
    getResourceStats,
    getBranches,
    getSubjects,
    searchResources,
    bulkDeleteResources,
} from "../controllers/resourceController.js";
import upload from "../middleware/upload.js";
import { handleMulterError } from "../middleware/upload.js";
import {
    validatePYQUpload,
    validateNotesUpload,
    validateSyllabusUpload,
    validateContentLinkUpload,
    validateResourceQuery,
    validateResourceId,
    validateResourceSearch,
    validateBulkDelete,
    handleValidationErrors,
} from "../middleware/validation.js";

const router = express.Router();

// Upload PYQ (Previous Year Questions) - requires file upload
router.post(
    "/upload/pyq",
    upload.single("file"),
    handleMulterError,
    validatePYQUpload,
    handleValidationErrors,
    uploadPYQ,
);

// Upload Notes - requires file upload
router.post(
    "/upload/notes",
    upload.single("file"),
    handleMulterError,
    validateNotesUpload,
    handleValidationErrors,
    uploadNotes,
);

// Upload Syllabus - text-based, no file upload
router.post(
    "/upload/syllabus",
    validateSyllabusUpload,
    handleValidationErrors,
    uploadSyllabus,
);

// Upload Content Link - URL-based, no file upload
router.post(
    "/upload/content",
    validateContentLinkUpload,
    handleValidationErrors,
    uploadContentLink,
);

// Get resources with filtering and pagination
router.get(
    "/get-resources",
    validateResourceQuery,
    handleValidationErrors,
    getResources,
);

// Search resources
router.get(
    "/search",
    validateResourceSearch,
    handleValidationErrors,
    searchResources,
);

// Get resource by ID
router.get(
    "/resource/:id",
    validateResourceId,
    handleValidationErrors,
    getResourceById,
);

// Download resource
router.get(
    "/resource/:id/download",
    validateResourceId,
    handleValidationErrors,
    downloadResource,
);

// Delete resource
router.delete(
    "/resource/:id",
    validateResourceId,
    handleValidationErrors,
    deleteResource,
);

// Bulk delete resources
router.delete(
    "/bulk-delete",
    validateBulkDelete,
    handleValidationErrors,
    bulkDeleteResources,
);

// Get resource statistics
router.get("/resource/stats/overview", getResourceStats);

// Get available branches
router.get("/resource/meta/branches", getBranches);

// Get available subjects
router.get(
    "/resource/meta/subjects",
    validateResourceQuery,
    handleValidationErrors,
    getSubjects,
);

export default router;
