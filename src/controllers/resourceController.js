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
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockDatabase = {
    resources: [],
    nextId: 1,
};

export const uploadResource = async (req, res) => {
    const uploadedFile = req.file;

    try {
        if (!uploadedFile) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        await initCloudinary();

        const {
            branch,
            semester,
            subject,
            resourceType,
            title,
            description,
            syllabusText,
            contentLink,
            tags,
        } = req.body;

        const parsedTags = tags ? tags.split(",").map((tag) => tag.trim()) : [];

        const uploadOptions = {
            context: {
                branch,
                semester: parseInt(semester),
                subject,
                resourceType,
                title,
                description: description || "",
            },
            tags: [branch, `semester_${semester}`, resourceType, ...parsedTags],
        };

        const cloudinaryResult = await uploadFile(
            uploadedFile.path,
            uploadedFile.originalname,
            uploadedFile.mimetype,
            uploadOptions,
        );

        const resource = {
            id: mockDatabase.nextId++,
            branch,
            semester: parseInt(semester),
            subject,
            resourceType,
            title,
            description: description || null,
            syllabusText: syllabusText || null,
            contentLink: contentLink || null,
            tags: parsedTags,
            fileInfo: {
                originalName: uploadedFile.originalname,
                mimeType: uploadedFile.mimetype,
                size: uploadedFile.size,
                cloudinaryId: cloudinaryResult.id,
                cloudinaryUrl: cloudinaryResult.url,
                viewUrl: cloudinaryResult.viewUrl,
                format: cloudinaryResult.format,
                resourceType: cloudinaryResult.resourceType,
                version: cloudinaryResult.version,
            },
            uploadedAt: new Date(),
            downloadCount: 0,
            lastAccessed: null,
        };

        mockDatabase.resources.push(resource);

        try {
            await fs.promises.unlink(uploadedFile.path);
            logger.info(`Local file cleaned up: ${uploadedFile.path}`);
        } catch (cleanupError) {
            logger.warn(
                `Failed to cleanup local file: ${cleanupError.message}`,
            );
        }

        logger.info(
            `Resource uploaded successfully: ${title} (ID: ${resource.id})`,
        );

        res.status(201).json({
            success: true,
            message: "Resource uploaded successfully",
            resource: {
                id: resource.id,
                title: resource.title,
                branch: resource.branch,
                semester: resource.semester,
                subject: resource.subject,
                resourceType: resource.resourceType,
                description: resource.description,
                tags: resource.tags,
                uploadedAt: resource.uploadedAt,
                downloadCount: resource.downloadCount,
                fileInfo: {
                    originalName: resource.fileInfo.originalName,
                    size: resource.fileInfo.size,
                    viewUrl: resource.fileInfo.viewUrl,
                    format: resource.fileInfo.format,
                },
            },
        });
    } catch (error) {
        logger.error(`Resource upload failed: ${error.message}`);

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
            message: "Failed to upload resource",
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
            sortBy = "uploadedAt",
            sortOrder = "desc",
        } = req.query;

        let filteredResources = [...mockDatabase.resources];

        if (branch) {
            filteredResources = filteredResources.filter(
                (r) => r.branch === branch,
            );
        }
        if (semester) {
            filteredResources = filteredResources.filter(
                (r) => r.semester === parseInt(semester),
            );
        }
        if (subject) {
            filteredResources = filteredResources.filter((r) =>
                r.subject.toLowerCase().includes(subject.toLowerCase()),
            );
        }
        if (resourceType) {
            filteredResources = filteredResources.filter(
                (r) => r.resourceType === resourceType,
            );
        }
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredResources = filteredResources.filter(
                (r) =>
                    r.title.toLowerCase().includes(searchTerm) ||
                    r.description?.toLowerCase().includes(searchTerm) ||
                    r.subject.toLowerCase().includes(searchTerm) ||
                    r.tags.some((tag) =>
                        tag.toLowerCase().includes(searchTerm),
                    ),
            );
        }

        filteredResources.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === "uploadedAt" || sortBy === "lastAccessed") {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedResources = filteredResources.slice(
            startIndex,
            endIndex,
        );

        const formattedResources = paginatedResources.map((resource) => ({
            id: resource.id,
            title: resource.title,
            branch: resource.branch,
            semester: resource.semester,
            subject: resource.subject,
            resourceType: resource.resourceType,
            description: resource.description,
            tags: resource.tags,
            uploadedAt: resource.uploadedAt,
            downloadCount: resource.downloadCount,
            lastAccessed: resource.lastAccessed,
            fileInfo: {
                originalName: resource.fileInfo.originalName,
                size: resource.fileInfo.size,
                viewUrl: resource.fileInfo.viewUrl,
                format: resource.fileInfo.format,
            },
        }));

        res.json({
            success: true,
            message: "Resources retrieved successfully",
            data: {
                resources: formattedResources,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(filteredResources.length / limitNum),
                    totalItems: filteredResources.length,
                    itemsPerPage: limitNum,
                    hasNextPage: endIndex < filteredResources.length,
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

        let expression = "";

        expression += "folder:campushub-resources";

        if (searchQuery) {
            expression += ` AND (filename:*${searchQuery}* OR context.title:*${searchQuery}* OR context.description:*${searchQuery}*)`;
        }

        if (branch) {
            expression += ` AND tags:${branch}`;
        }

        if (semester) {
            expression += ` AND tags:semester_${semester}`;
        }

        if (resourceType) {
            expression += ` AND tags:${resourceType}`;
        }

        await initCloudinary();
        const cloudinaryResults = await searchFiles(expression, {
            limit: parseInt(limit),
            sortBy: "created_at",
            sortOrder: "desc",
        });

        const matchedResources = mockDatabase.resources.filter((resource) =>
            cloudinaryResults.resources.some(
                (cloudResource) =>
                    cloudResource.id === resource.fileInfo.cloudinaryId,
            ),
        );

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedResources = matchedResources.slice(startIndex, endIndex);

        res.json({
            success: true,
            message: "Search completed successfully",
            data: {
                resources: paginatedResources.map((resource) => ({
                    id: resource.id,
                    title: resource.title,
                    branch: resource.branch,
                    semester: resource.semester,
                    subject: resource.subject,
                    resourceType: resource.resourceType,
                    description: resource.description,
                    tags: resource.tags,
                    uploadedAt: resource.uploadedAt,
                    downloadCount: resource.downloadCount,
                    fileInfo: {
                        originalName: resource.fileInfo.originalName,
                        size: resource.fileInfo.size,
                        viewUrl: resource.fileInfo.viewUrl,
                        format: resource.fileInfo.format,
                    },
                })),
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(matchedResources.length / limitNum),
                    totalItems: matchedResources.length,
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
        const resourceId = parseInt(id);

        const resource = mockDatabase.resources.find(
            (r) => r.id === resourceId,
        );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }

        resource.lastAccessed = new Date();

        let cloudinaryFileInfo = null;
        try {
            await initCloudinary();
            cloudinaryFileInfo = await getFileInfo(
                resource.fileInfo.cloudinaryId,
            );
        } catch (cloudinaryError) {
            logger.warn(
                `Failed to get Cloudinary file info: ${cloudinaryError.message}`,
            );
        }

        res.json({
            success: true,
            message: "Resource retrieved successfully",
            resource: {
                id: resource.id,
                title: resource.title,
                branch: resource.branch,
                semester: resource.semester,
                subject: resource.subject,
                resourceType: resource.resourceType,
                description: resource.description,
                syllabusText: resource.syllabusText,
                contentLink: resource.contentLink,
                tags: resource.tags,
                uploadedAt: resource.uploadedAt,
                downloadCount: resource.downloadCount,
                lastAccessed: resource.lastAccessed,
                fileInfo: {
                    originalName: resource.fileInfo.originalName,
                    mimeType: resource.fileInfo.mimeType,
                    size: resource.fileInfo.size,
                    cloudinaryId: resource.fileInfo.cloudinaryId,
                    cloudinaryUrl: resource.fileInfo.cloudinaryUrl,
                    viewUrl: resource.fileInfo.viewUrl,
                    format: resource.fileInfo.format,
                    version: resource.fileInfo.version,
                    cloudinaryFileInfo: cloudinaryFileInfo,
                },
            },
        });

        logger.info(
            `Resource retrieved: ${resource.title} (ID: ${resourceId})`,
        );
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
        const resourceId = parseInt(id);

        const resource = mockDatabase.resources.find(
            (r) => r.id === resourceId,
        );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }

        resource.downloadCount++;
        resource.lastAccessed = new Date();

        res.json({
            success: true,
            message: "Download link retrieved successfully",
            download: {
                resourceId: resource.id,
                title: resource.title,
                fileName: resource.fileInfo.originalName,
                downloadUrl: resource.fileInfo.cloudinaryUrl,
                viewUrl: resource.fileInfo.viewUrl,
                size: resource.fileInfo.size,
                mimeType: resource.fileInfo.mimeType,
                format: resource.fileInfo.format,
                downloadCount: resource.downloadCount,
            },
        });

        logger.info(
            `Download initiated for resource: ${resource.title} (ID: ${resourceId})`,
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
        const resourceId = parseInt(id);

        const resourceIndex = mockDatabase.resources.findIndex(
            (r) => r.id === resourceId,
        );

        if (resourceIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }

        const resource = mockDatabase.resources[resourceIndex];

        try {
            await initCloudinary();
            await deleteFile(resource.fileInfo.cloudinaryId);
            logger.info(
                `File deleted from Cloudinary: ${resource.fileInfo.cloudinaryId}`,
            );
        } catch (cloudinaryError) {
            logger.warn(
                `Failed to delete from Cloudinary: ${cloudinaryError.message}`,
            );
        }

        mockDatabase.resources.splice(resourceIndex, 1);

        res.json({
            success: true,
            message: "Resource deleted successfully",
            deletedResource: {
                id: resource.id,
                title: resource.title,
                fileName: resource.fileInfo.originalName,
            },
        });

        logger.info(
            `Resource deleted successfully: ${resource.title} (ID: ${resourceId})`,
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

        const resourcesToDelete = mockDatabase.resources.filter((r) =>
            resourceIds.includes(r.id.toString()),
        );

        if (resourcesToDelete.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No resources found for deletion",
            });
        }

        const cloudinaryIds = resourcesToDelete.map(
            (r) => r.fileInfo.cloudinaryId,
        );

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

        mockDatabase.resources = mockDatabase.resources.filter(
            (r) => !resourceIds.includes(r.id.toString()),
        );

        res.json({
            success: true,
            message: `Successfully deleted ${resourcesToDelete.length} resources`,
            deletedCount: resourcesToDelete.length,
            deletedResources: resourcesToDelete.map((r) => ({
                id: r.id,
                title: r.title,
                fileName: r.fileInfo.originalName,
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
        const resources = mockDatabase.resources;

        const totalResources = resources.length;
        const totalDownloads = resources.reduce(
            (sum, r) => sum + r.downloadCount,
            0,
        );
        const totalSize = resources.reduce(
            (sum, r) => sum + r.fileInfo.size,
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
                id: r.id,
                title: r.title,
                branch: r.branch,
                semester: r.semester,
                resourceType: r.resourceType,
                downloadCount: r.downloadCount,
            }));

        const recentUploads = resources
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
            .slice(0, 10)
            .map((r) => ({
                id: r.id,
                title: r.title,
                branch: r.branch,
                semester: r.semester,
                resourceType: r.resourceType,
                uploadedAt: r.uploadedAt,
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
            { code: "EIE", name: "Electronics and Instrumentation Engineering" },
            {
                code: "IT",
                name: "Information Technology",
            },
        ];

        const branchesWithCounts = branches.map((branch) => {
            const count = mockDatabase.resources.filter(
                (r) => r.branch === branch.code,
            ).length;
            return { ...branch, resourceCount: count };
        });

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

        let filteredResources = [...mockDatabase.resources];

        if (branch) {
            filteredResources = filteredResources.filter(
                (r) => r.branch === branch,
            );
        }
        if (semester) {
            filteredResources = filteredResources.filter(
                (r) => r.semester === parseInt(semester),
            );
        }

        const subjectMap = {};
        filteredResources.forEach((resource) => {
            if (!subjectMap[resource.subject]) {
                subjectMap[resource.subject] = {
                    name: resource.subject,
                    resourceCount: 0,
                    branches: new Set(),
                    semesters: new Set(),
                    types: new Set(),
                };
            }
            subjectMap[resource.subject].resourceCount++;
            subjectMap[resource.subject].branches.add(resource.branch);
            subjectMap[resource.subject].semesters.add(resource.semester);
            subjectMap[resource.subject].types.add(resource.resourceType);
        });

        const subjects = Object.values(subjectMap).map((subject) => ({
            name: subject.name,
            resourceCount: subject.resourceCount,
            branches: Array.from(subject.branches),
            semesters: Array.from(subject.semesters).sort((a, b) => a - b),
            resourceTypes: Array.from(subject.types),
        }));

        subjects.sort((a, b) => {
            if (b.resourceCount !== a.resourceCount) {
                return b.resourceCount - a.resourceCount;
            }
            return a.name.localeCompare(b.name);
        });

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
