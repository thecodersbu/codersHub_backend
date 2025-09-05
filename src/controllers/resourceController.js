import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
    uploadFile,
    deleteFile,
    getFileInfo,
    listFiles,
    getStorageInfo,
    searchFiles,
    bulkDelete,
    initCloudinary,
} from "../services/cloudinaryService.js";
import { Resource } from "../models/Resource.js";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadPYQ = async (req, res) => {
    const uploadedFile = req.file;

    try {
        if (!uploadedFile) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        await initCloudinary();

        const { branch, semester, subject, title, description, tags } =
            req.body;

        const parsedTags = tags ? tags.split(",").map((tag) => tag.trim()) : [];

        const uploadOptions = {
            context: {
                branch,
                semester: parseInt(semester),
                subject,
                resourceType: "pyq",
                title,
                description: description || "",
            },
            tags: [branch, `semester_${semester}`, "pyq", ...parsedTags],
        };

        const cloudinaryResult = await uploadFile(
            uploadedFile.path,
            uploadedFile.originalname,
            uploadedFile.mimetype,
            uploadOptions,
        );

        const resource = new Resource({
            branch,
            semester: parseInt(semester),
            subject,
            resourceType: "pyq",
            title,
            description: description || null,
            tags: parsedTags,
            fileUrl: cloudinaryResult.url,
            fileId: cloudinaryResult.id,
            fileName: uploadedFile.originalname,
            fileSize: uploadedFile.size,
            uploadedBy: "admin", // You can modify this based on authentication
        });

        await resource.save();

        try {
            await fs.promises.unlink(uploadedFile.path);
            logger.info(`Local file cleaned up: ${uploadedFile.path}`);
        } catch (cleanupError) {
            logger.warn(
                `Failed to cleanup local file: ${cleanupError.message}`,
            );
        }

        logger.info(
            `PYQ uploaded successfully: ${title} (ID: ${resource._id})`,
        );

        res.status(201).json({
            success: true,
            message: "PYQ uploaded successfully",
            resource: {
                id: resource._id,
                title: resource.title,
                branch: resource.branch,
                semester: resource.semester,
                subject: resource.subject,
                resourceType: resource.resourceType,
                description: resource.description,
                tags: resource.tags,
                fileUrl: resource.fileUrl,
                uploadedAt: resource.createdAt,
                downloadCount: resource.downloadCount,
            },
        });
    } catch (error) {
        logger.error(`PYQ upload failed: ${error.message}`);

        if (uploadedFile && uploadedFile.path) {
            try {
                await fs.promises.unlink(uploadedFile.path);
            } catch (cleanupError) {
                logger.warn(
                    `Failed to cleanup file after error: ${cleanupError.message}`,
                );
            }
        }

        res.status(500).json({
            success: false,
            message: "Failed to upload PYQ",
            error: error.message,
        });
    }
};

export const uploadNotes = async (req, res) => {
    const uploadedFile = req.file;

    try {
        if (!uploadedFile) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        await initCloudinary();

        const { branch, semester, subject, title, description, tags } =
            req.body;

        const parsedTags = tags ? tags.split(",").map((tag) => tag.trim()) : [];

        const uploadOptions = {
            context: {
                branch,
                semester: parseInt(semester),
                subject,
                resourceType: "notes",
                title,
                description: description || "",
            },
            tags: [branch, `semester_${semester}`, "notes", ...parsedTags],
        };

        const cloudinaryResult = await uploadFile(
            uploadedFile.path,
            uploadedFile.originalname,
            uploadedFile.mimetype,
            uploadOptions,
        );

        const resource = new Resource({
            branch,
            semester: parseInt(semester),
            subject,
            resourceType: "notes",
            title,
            description: description || null,
            tags: parsedTags,
            fileUrl: cloudinaryResult.url,
            fileId: cloudinaryResult.id,
            fileName: uploadedFile.originalname,
            fileSize: uploadedFile.size,
            uploadedBy: "admin",
        });

        await resource.save();

        try {
            await fs.promises.unlink(uploadedFile.path);
            logger.info(`Local file cleaned up: ${uploadedFile.path}`);
        } catch (cleanupError) {
            logger.warn(
                `Failed to cleanup local file: ${cleanupError.message}`,
            );
        }

        logger.info(
            `Notes uploaded successfully: ${title} (ID: ${resource._id})`,
        );

        res.status(201).json({
            success: true,
            message: "Notes uploaded successfully",
            resource: {
                id: resource._id,
                title: resource.title,
                branch: resource.branch,
                semester: resource.semester,
                subject: resource.subject,
                resourceType: resource.resourceType,
                description: resource.description,
                tags: resource.tags,
                fileUrl: resource.fileUrl,
                uploadedAt: resource.createdAt,
                downloadCount: resource.downloadCount,
            },
        });
    } catch (error) {
        logger.error(`Notes upload failed: ${error.message}`);

        if (uploadedFile && uploadedFile.path) {
            try {
                await fs.promises.unlink(uploadedFile.path);
            } catch (cleanupError) {
                logger.warn(
                    `Failed to cleanup file after error: ${cleanupError.message}`,
                );
            }
        }

        res.status(500).json({
            success: false,
            message: "Failed to upload notes",
            error: error.message,
        });
    }
};

export const uploadSyllabus = async (req, res) => {
    try {
        const {
            branch,
            semester,
            subject,
            title,
            description,
            syllabusText,
            tags,
        } = req.body;

        if (!syllabusText || syllabusText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Syllabus text is required",
            });
        }

        const parsedTags = tags ? tags.split(",").map((tag) => tag.trim()) : [];

        const resource = new Resource({
            branch,
            semester: parseInt(semester),
            subject,
            resourceType: "syllabus",
            title,
            description: description || null,
            syllabusText,
            tags: parsedTags,
            uploadedBy: "admin",
        });

        await resource.save();

        logger.info(
            `Syllabus uploaded successfully: ${title} (ID: ${resource._id})`,
        );

        res.status(201).json({
            success: true,
            message: "Syllabus uploaded successfully",
            resource: {
                id: resource._id,
                title: resource.title,
                branch: resource.branch,
                semester: resource.semester,
                subject: resource.subject,
                resourceType: resource.resourceType,
                description: resource.description,
                syllabusText: resource.syllabusText,
                tags: resource.tags,
                uploadedAt: resource.createdAt,
                downloadCount: resource.downloadCount,
            },
        });
    } catch (error) {
        logger.error(`Syllabus upload failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Failed to upload syllabus",
            error: error.message,
        });
    }
};

export const uploadContentLink = async (req, res) => {
    try {
        const {
            branch,
            semester,
            subject,
            title,
            description,
            contentLink,
            tags,
        } = req.body;

        if (!contentLink || !contentLink.match(/^https?:\/\/.+/)) {
            return res.status(400).json({
                success: false,
                message: "Valid content link URL is required",
            });
        }

        const parsedTags = tags ? tags.split(",").map((tag) => tag.trim()) : [];

        const resource = new Resource({
            branch,
            semester: parseInt(semester),
            subject,
            resourceType: "content",
            title,
            description: description || null,
            contentLink,
            tags: parsedTags,
            uploadedBy: "admin",
        });

        await resource.save();

        logger.info(
            `Content link uploaded successfully: ${title} (ID: ${resource._id})`,
        );

        res.status(201).json({
            success: true,
            message: "Content link uploaded successfully",
            resource: {
                id: resource._id,
                title: resource.title,
                branch: resource.branch,
                semester: resource.semester,
                subject: resource.subject,
                resourceType: resource.resourceType,
                description: resource.description,
                contentLink: resource.contentLink,
                tags: resource.tags,
                uploadedAt: resource.createdAt,
                downloadCount: resource.downloadCount,
            },
        });
    } catch (error) {
        logger.error(`Content link upload failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Failed to upload content link",
            error: error.message,
        });
    }
};

export const getResources = async (req, res) => {
    try {
        const {
            branch,
            semester,
            subject,
            resourceType,
            search,
            page = 1,
            limit = 20,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const query = { isActive: true };

        if (branch) query.branch = branch;
        if (semester) query.semester = parseInt(semester);
        if (subject) query.subject = new RegExp(subject, "i");
        if (resourceType) query.resourceType = resourceType;

        if (search) {
            query.$or = [
                { title: new RegExp(search, "i") },
                { description: new RegExp(search, "i") },
                { subject: new RegExp(search, "i") },
                { tags: { $in: [new RegExp(search, "i")] } },
                { syllabusText: new RegExp(search, "i") },
            ];
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        const [resources, totalCount] = await Promise.all([
            Resource.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
            Resource.countDocuments(query),
        ]);

        const formattedResources = resources.map((resource) => ({
            id: resource._id,
            title: resource.title,
            branch: resource.branch,
            semester: resource.semester,
            subject: resource.subject,
            resourceType: resource.resourceType,
            description: resource.description,
            tags: resource.tags,
            uploadedAt: resource.createdAt,
            downloadCount: resource.downloadCount,
            fileUrl: resource.fileUrl,
            fileId: resource.fileId,
            fileName: resource.fileName,
            fileSize: resource.fileSize,
            syllabusText: resource.syllabusText,
            contentLink: resource.contentLink,
        }));

        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            success: true,
            message: "Resources retrieved successfully",
            data: {
                resources: formattedResources,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalItems: totalCount,
                    itemsPerPage: limitNum,
                    hasNextPage: pageNum < totalPages,
                    hasPreviousPage: pageNum > 1,
                },
                filters: {
                    branch,
                    semester: semester ? parseInt(semester) : null,
                    subject,
                    resourceType,
                    search,
                },
                sorting: {
                    sortBy,
                    sortOrder,
                },
            },
        });

        logger.info(
            `Retrieved ${formattedResources.length} resources with filters applied`,
        );
    } catch (error) {
        logger.error(`Failed to retrieve resources: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve resources",
            error: error.message,
        });
    }
};

export const searchResources = async (req, res) => {
    try {
        const {
            q: searchQuery,
            branch,
            semester,
            resourceType,
            page = 1,
            limit = 20,
        } = req.query;

        const query = { isActive: true };

        if (branch) query.branch = branch;
        if (semester) query.semester = parseInt(semester);
        if (resourceType) query.resourceType = resourceType;

        if (searchQuery) {
            query.$text = { $search: searchQuery };
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [resources, totalCount] = await Promise.all([
            Resource.find(query)
                .sort(
                    searchQuery
                        ? { score: { $meta: "textScore" } }
                        : { createdAt: -1 },
                )
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Resource.countDocuments(query),
        ]);

        const formattedResources = resources.map((resource) => ({
            id: resource._id,
            title: resource.title,
            branch: resource.branch,
            semester: resource.semester,
            subject: resource.subject,
            resourceType: resource.resourceType,
            description: resource.description,
            tags: resource.tags,
            uploadedAt: resource.createdAt,
            downloadCount: resource.downloadCount,
            fileUrl: resource.fileUrl,
            fileName: resource.fileName,
            fileSize: resource.fileSize,
            syllabusText: resource.syllabusText,
            contentLink: resource.contentLink,
        }));

        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            success: true,
            message: "Search completed successfully",
            data: {
                resources: formattedResources,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalItems: totalCount,
                    itemsPerPage: limitNum,
                },
                searchQuery,
                filters: { branch, semester, resourceType },
            },
        });
    } catch (error) {
        logger.error(`Search failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Search failed",
            error: error.message,
        });
    }
};

export const getResourceById = async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await Resource.findById(id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }

        let cloudinaryFileInfo = null;
        if (resource.fileId) {
            try {
                await initCloudinary();
                cloudinaryFileInfo = await getFileInfo(resource.fileId);
            } catch (cloudinaryError) {
                logger.warn(
                    `Failed to get Cloudinary file info: ${cloudinaryError.message}`,
                );
            }
        }

        res.json({
            success: true,
            message: "Resource retrieved successfully",
            resource: {
                id: resource._id,
                title: resource.title,
                branch: resource.branch,
                semester: resource.semester,
                subject: resource.subject,
                resourceType: resource.resourceType,
                description: resource.description,
                syllabusText: resource.syllabusText,
                contentLink: resource.contentLink,
                tags: resource.tags,
                uploadedAt: resource.createdAt,
                downloadCount: resource.downloadCount,
                fileUrl: resource.fileUrl,
                fileId: resource.fileId,
                fileName: resource.fileName,
                fileSize: resource.fileSize,
                cloudinaryFileInfo: cloudinaryFileInfo,
            },
        });

        logger.info(`Resource retrieved: ${resource.title} (ID: ${id})`);
    } catch (error) {
        logger.error(`Failed to retrieve resource: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve resource",
            error: error.message,
        });
    }
};

export const downloadResource = async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await Resource.findById(id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }

        resource.downloadCount += 1;
        await resource.save();

        if (resource.resourceType === "syllabus") {
            res.json({
                success: true,
                message: "Syllabus content retrieved successfully",
                download: {
                    resourceId: resource._id,
                    title: resource.title,
                    resourceType: resource.resourceType,
                    syllabusText: resource.syllabusText,
                    downloadCount: resource.downloadCount,
                },
            });
        } else if (resource.resourceType === "content") {
            res.json({
                success: true,
                message: "Content link retrieved successfully",
                download: {
                    resourceId: resource._id,
                    title: resource.title,
                    resourceType: resource.resourceType,
                    contentLink: resource.contentLink,
                    downloadCount: resource.downloadCount,
                },
            });
        } else {
            if (!resource.fileUrl) {
                return res.status(404).json({
                    success: false,
                    message: "File not found for this resource",
                });
            }

            res.json({
                success: true,
                message: "Download link retrieved successfully",
                download: {
                    resourceId: resource._id,
                    title: resource.title,
                    fileName: resource.fileName,
                    downloadUrl: resource.fileUrl,
                    size: resource.fileSize,
                    resourceType: resource.resourceType,
                    downloadCount: resource.downloadCount,
                },
            });
        }

        logger.info(
            `Download initiated for resource: ${resource.title} (ID: ${id})`,
        );
    } catch (error) {
        logger.error(`Failed to process download: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Failed to process download",
            error: error.message,
        });
    }
};

export const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await Resource.findById(id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }

        if (resource.fileId) {
            try {
                await initCloudinary();
                await deleteFile(resource.fileId);
                logger.info(`File deleted from Cloudinary: ${resource.fileId}`);
            } catch (cloudinaryError) {
                logger.warn(
                    `Failed to delete from Cloudinary: ${cloudinaryError.message}`,
                );
            }
        }

        await Resource.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Resource deleted successfully",
            deletedResource: {
                id: resource._id,
                title: resource.title,
                fileName: resource.fileName,
                resourceType: resource.resourceType,
            },
        });

        logger.info(
            `Resource deleted successfully: ${resource.title} (ID: ${id})`,
        );
    } catch (error) {
        logger.error(`Failed to delete resource: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Failed to delete resource",
            error: error.message,
        });
    }
};

export const bulkDeleteResources = async (req, res) => {
    try {
        const { resourceIds } = req.body;

        const resourcesToDelete = await Resource.find({
            _id: { $in: resourceIds },
            isActive: true,
        });

        if (resourcesToDelete.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No resources found for deletion",
            });
        }

        const cloudinaryIds = resourcesToDelete
            .filter((r) => r.fileId)
            .map((r) => r.fileId);

        if (cloudinaryIds.length > 0) {
            try {
                await initCloudinary();
                await bulkDelete(cloudinaryIds);
                logger.info(
                    `Bulk deleted ${cloudinaryIds.length} files from Cloudinary`,
                );
            } catch (cloudinaryError) {
                logger.warn(
                    `Failed to bulk delete from Cloudinary: ${cloudinaryError.message}`,
                );
            }
        }

        await Resource.deleteMany({ _id: { $in: resourceIds } });

        res.json({
            success: true,
            message: `Successfully deleted ${resourcesToDelete.length} resources`,
            deletedCount: resourcesToDelete.length,
            deletedResources: resourcesToDelete.map((r) => ({
                id: r._id,
                title: r.title,
                fileName: r.fileName,
                resourceType: r.resourceType,
            })),
        });

        logger.info(
            `Bulk deleted ${resourcesToDelete.length} resources successfully`,
        );
    } catch (error) {
        logger.error(`Failed to bulk delete resources: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Failed to bulk delete resources",
            error: error.message,
        });
    }
};

export const getResourceStats = async (req, res) => {
    try {
        const resources = await Resource.find({ isActive: true });

        const totalResources = resources.length;
        const totalDownloads = resources.reduce(
            (sum, r) => sum + r.downloadCount,
            0,
        );
        const totalSize = resources.reduce(
            (sum, r) => sum + (r.fileSize || 0),
            0,
        );

        const branchStats = {};
        resources.forEach((r) => {
            if (!branchStats[r.branch]) {
                branchStats[r.branch] = { count: 0, downloads: 0 };
            }
            branchStats[r.branch].count++;
            branchStats[r.branch].downloads += r.downloadCount;
        });

        const typeStats = {};
        resources.forEach((r) => {
            if (!typeStats[r.resourceType]) {
                typeStats[r.resourceType] = { count: 0, downloads: 0 };
            }
            typeStats[r.resourceType].count++;
            typeStats[r.resourceType].downloads += r.downloadCount;
        });

        const semesterStats = {};
        resources.forEach((r) => {
            if (!semesterStats[r.semester]) {
                semesterStats[r.semester] = { count: 0, downloads: 0 };
            }
            semesterStats[r.semester].count++;
            semesterStats[r.semester].downloads += r.downloadCount;
        });

        const mostDownloaded = resources
            .sort((a, b) => b.downloadCount - a.downloadCount)
            .slice(0, 10)
            .map((r) => ({
                id: r._id,
                title: r.title,
                branch: r.branch,
                semester: r.semester,
                resourceType: r.resourceType,
                downloadCount: r.downloadCount,
            }));

        const recentUploads = resources
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map((r) => ({
                id: r._id,
                title: r.title,
                branch: r.branch,
                semester: r.semester,
                resourceType: r.resourceType,
                uploadedAt: r.createdAt,
            }));

        let storageInfo = null;
        try {
            await initCloudinary();
            storageInfo = await getStorageInfo();
        } catch (storageError) {
            logger.warn(`Failed to get storage info: ${storageError.message}`);
        }

        res.json({
            success: true,
            message: "Resource statistics retrieved successfully",
            stats: {
                overview: {
                    totalResources,
                    totalDownloads,
                    totalSize,
                    averageDownloads:
                        totalResources > 0
                            ? Math.round(totalDownloads / totalResources)
                            : 0,
                    averageSize:
                        totalResources > 0
                            ? Math.round(totalSize / totalResources)
                            : 0,
                },
                breakdown: {
                    byBranch: branchStats,
                    byType: typeStats,
                    bySemester: semesterStats,
                },
                topContent: {
                    mostDownloaded,
                    recentUploads,
                },
                cloudinary: storageInfo,
            },
        });

        logger.info("Resource statistics retrieved successfully");
    } catch (error) {
        logger.error(`Failed to retrieve statistics: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve statistics",
            error: error.message,
        });
    }
};

export const getBranches = async (req, res) => {
    try {
        const branches = [
            { code: "CSE", name: "Computer Science and Engineering" },
            { code: "ECE", name: "Electronics and Communication Engineering" },
            { code: "ME", name: "Mechanical Engineering" },
            { code: "BT", name: "Biotechnology" },
            { code: "BM", name: "Biomedical Engineering" },
            { code: "FT", name: "Food Technology" },
            {
                code: "EIE",
                name: "Electronics and Instrumentation Engineering",
            },
            { code: "IT", name: "Information Technology" },
        ];

        const branchCounts = await Resource.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: "$branch", count: { $sum: 1 } } },
        ]);

        const branchCountMap = {};
        branchCounts.forEach((item) => {
            branchCountMap[item._id] = item.count;
        });

        const branchesWithCounts = branches.map((branch) => ({
            ...branch,
            resourceCount: branchCountMap[branch.code] || 0,
        }));

        res.json({
            success: true,
            message: "Branches retrieved successfully",
            branches: branchesWithCounts,
        });

        logger.info("Branches list retrieved successfully");
    } catch (error) {
        logger.error(`Failed to retrieve branches: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve branches",
            error: error.message,
        });
    }
};

export const getSubjects = async (req, res) => {
    try {
        const { branch, semester } = req.query;

        const matchQuery = { isActive: true };
        if (branch) matchQuery.branch = branch;
        if (semester) matchQuery.semester = parseInt(semester);

        const subjects = await Resource.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: "$subject",
                    resourceCount: { $sum: 1 },
                    branches: { $addToSet: "$branch" },
                    semesters: { $addToSet: "$semester" },
                    resourceTypes: { $addToSet: "$resourceType" },
                },
            },
            {
                $project: {
                    name: "$_id",
                    resourceCount: 1,
                    branches: 1,
                    semesters: {
                        $sortArray: { input: "$semesters", sortBy: 1 },
                    },
                    resourceTypes: 1,
                    _id: 0,
                },
            },
            { $sort: { resourceCount: -1, name: 1 } },
        ]);

        res.json({
            success: true,
            message: "Subjects retrieved successfully",
            subjects: subjects,
            filters: {
                branch,
                semester: semester ? parseInt(semester) : null,
            },
            totalSubjects: subjects.length,
        });

        logger.info(
            `Retrieved ${subjects.length} subjects with applied filters`,
        );
    } catch (error) {
        logger.error(`Failed to retrieve subjects: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve subjects",
            error: error.message,
        });
    }
};
