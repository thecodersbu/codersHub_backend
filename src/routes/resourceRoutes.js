import express from "express";
import {
    uploadResource,
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
    validateResourceUpload,
    validateResourceQuery,
    validateResourceId,
    validateResourceSearch,
    validateBulkDelete,
    handleValidationErrors,
} from "../middleware/validation.js";

const router = express.Router();

// Upload resource
router.post(
    "/upload",
    upload.single("file"),
    handleMulterError,
    validateResourceUpload,
    handleValidationErrors,
    uploadResource,
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
