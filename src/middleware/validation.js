import { body, query, param, validationResult } from "express-validator";

export const validateResourceUpload = [
    body("branch")
        .notEmpty()
        .withMessage("Branch is required")
        .isIn(["CSE", "ECE", "ME", "EIE", "BT", "BM", "FT", "IT"])
        .withMessage("Invalid branch"),
    body("semester")
        .isInt({ min: 1, max: 8 })
        .withMessage("Semester must be between 1 and 8"),
    body("subject")
        .notEmpty()
        .withMessage("Subject is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Subject must be between 2 and 100 characters"),
    body("resourceType")
        .isIn(["pyq", "notes", "syllabus", "content"])
        .withMessage("Invalid resource type"),
    body("title")
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 3, max: 200 })
        .withMessage("Title must be between 3 and 200 characters"),
    body("description")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Description must be less than 1000 characters"),
    body("syllabusText")
        .if(body("resourceType").equals("syllabus"))
        .notEmpty()
        .withMessage("Syllabus text is required for syllabus resources")
        .isLength({ min: 10 })
        .withMessage("Syllabus text must be at least 10 characters"),
    body("contentLink")
        .if(body("resourceType").equals("content"))
        .notEmpty()
        .withMessage("Content link is required for content resources")
        .isURL()
        .withMessage("Valid URL is required for content resources"),
    body("tags")
        .optional()
        .isString()
        .withMessage("Tags must be a comma-separated string"),
];

export const validateResourceQuery = [
    query("branch")
        .optional()
        .isIn(["CSE", "ECE", "ME", "EIE", "BT", "BM", "FT", "IT"])
        .withMessage("Invalid branch"),
    query("semester")
        .optional()
        .isInt({ min: 1, max: 8 })
        .withMessage("Semester must be between 1 and 8"),
    query("resourceType")
        .optional()
        .isIn(["pyq", "notes", "syllabus", "content"])
        .withMessage("Invalid resource type"),
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),
    query("sortBy")
        .optional()
        .isIn(["createdAt", "title", "downloadCount", "semester"])
        .withMessage("Invalid sort field"),
    query("sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc"),
];

export const validateResourceSearch = [
    query("q")
        .notEmpty()
        .withMessage("Search query is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Search query must be between 2 and 100 characters"),
    query("branch")
        .optional()
        .isIn(["CSE", "ECE", "ME", "EIE", "BT", "BM", "FT", "IT"])
        .withMessage("Invalid branch"),
    query("semester")
        .optional()
        .isInt({ min: 1, max: 8 })
        .withMessage("Semester must be between 1 and 8"),
    query("resourceType")
        .optional()
        .isIn(["pyq", "notes", "syllabus", "content"])
        .withMessage("Invalid resource type"),
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),
];

export const validateBulkDelete = [
    body("resourceIds")
        .isArray({ min: 1 })
        .withMessage("Resource IDs array is required and must not be empty"),
    body("resourceIds.*")
        .isMongoId()
        .withMessage("Each resource ID must be a valid MongoDB ID"),
];

export const validateResourceId = [
    param("id").isMongoId().withMessage("Invalid resource ID"),
];

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((error) => ({
                field: error.param,
                message: error.msg,
                value: error.value,
            })),
        });
    }
    next();
};
