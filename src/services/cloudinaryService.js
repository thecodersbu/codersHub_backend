import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cloudConfig } from "../config/cloudConfig.js";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let initialized = false;

const maxFileSize = cloudConfig.cloudinary.maxFileSize;
const allowedMimeTypes = cloudConfig.cloudinary.allowedMimeTypes;
const folderName = cloudConfig.cloudinary.folderName;

export const initCloudinary = async () => {
    try {
        if (initialized) return;

        const { cloudName, apiKey, apiSecret } = cloudConfig.cloudinary;

        if (!cloudName || !apiKey || !apiSecret) {
            throw new Error(`Missing required Cloudinary configuration:
                - CLOUDINARY_CLOUD_NAME: ${cloudName ? "✓" : "✗"}
                - CLOUDINARY_API_KEY: ${apiKey ? "✓" : "✗"}
                - CLOUDINARY_API_SECRET: ${apiSecret ? "✓" : "✗"}`);
        }

        logger.info(`Initializing Cloudinary with cloud_name: ${cloudName}`);

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });

        await verifyCloudinarySetup();
        initialized = true;
        logger.info("Cloudinary service initialized successfully");
    } catch (error) {
        logger.error(`Cloudinary initialization failed: ${error.message}`);
        throw new Error(
            `Failed to initialize Cloudinary service: ${error.message}`,
        );
    }
};

export const verifyCloudinarySetup = async () => {
    try {
        const result = await cloudinary.api.ping();
        logger.info(`Cloudinary connection verified: ${result.status}`);

        try {
            const usage = await cloudinary.api.usage();
            logger.info(
                `Cloudinary plan: ${usage.plan || "Free"}, Storage used: ${usage.storage?.used || 0} bytes`,
            );
        } catch (usageError) {
            logger.warn(`Could not retrieve usage info: ${usageError.message}`);
        }
    } catch (error) {
        logger.error(`Cloudinary verification failed: ${error.message}`);
        throw new Error(
            `Cloudinary setup verification failed: ${error.message}`,
        );
    }
};

export const validateFile = async (filePath, mimeType) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found");
        }

        const stats = await fs.promises.stat(filePath);
        if (stats.size > maxFileSize) {
            throw new Error(
                `File size ${(stats.size / (1024 * 1024)).toFixed(
                    2,
                )}MB exceeds maximum limit of ${maxFileSize / (1024 * 1024)}MB`,
            );
        }
        if (!allowedMimeTypes.includes(mimeType)) {
            throw new Error(
                `File type ${mimeType} is not allowed. Allowed types: ${allowedMimeTypes.join(
                    ", ",
                )}`,
            );
        }
        return true;
    } catch (error) {
        throw error;
    }
};

export const uploadFile = async (
    filePath,
    fileName,
    mimeType = "application/pdf",
    options = {},
) => {
    try {
        if (!initialized) {
            await initCloudinary();
        }

        await validateFile(filePath, mimeType);

        const fileStats = await fs.promises.stat(filePath);

        const uploadOptions = {
            folder: folderName,
            public_id:
                options.publicId ||
                path.parse(fileName).name + "_" + Date.now(),
            resource_type: "auto", // Automatically detect resource type
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            context: options.context || {},
            tags: options.tags || [],
            ...options,
        };

        logger.info(`Uploading file: ${fileName} to folder: ${folderName}`);

        const response = await cloudinary.uploader.upload(
            filePath,
            uploadOptions,
        );

        const result = {
            id: response.public_id,
            name: fileName,
            url: response.secure_url,
            viewUrl: response.secure_url,
            size: fileStats.size,
            format: response.format,
            resourceType: response.resource_type,
            cloudinaryId: response.public_id,
            version: response.version,
            provider: "cloudinary",
        };

        logger.info(`File uploaded successfully: ${fileName} (${result.id})`);
        return result;
    } catch (error) {
        logger.error(`Cloudinary upload failed: ${error.message}`);
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

export const deleteFile = async (publicId) => {
    try {
        if (!initialized) await initCloudinary();

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto",
        });

        if (response.result === "ok" || response.result === "not found") {
            logger.info(`File deleted successfully: ${publicId}`);
            return true;
        } else {
            throw new Error(`Delete failed: ${response.result}`);
        }
    } catch (error) {
        logger.error(`Delete failed for ${publicId}: ${error.message}`);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
};

export const getFileInfo = async (publicId) => {
    try {
        if (!initialized) await initCloudinary();

        const response = await cloudinary.api.resource(publicId, {
            resource_type: "auto",
        });

        return {
            id: response.public_id,
            name: response.public_id.split("/").pop(),
            size: response.bytes,
            format: response.format,
            resourceType: response.resource_type,
            createdAt: response.created_at,
            url: response.secure_url,
            version: response.version,
            context: response.context,
            tags: response.tags,
            width: response.width,
            height: response.height,
        };
    } catch (error) {
        logger.error(`Get file info failed for ${publicId}: ${error.message}`);
        throw new Error(`Failed to get file info: ${error.message}`);
    }
};

export const listFiles = async (query = {}) => {
    try {
        if (!initialized) await initCloudinary();

        const searchOptions = {
            resource_type: "auto",
            type: "upload",
            max_results: query.limit || 100,
            next_cursor: query.nextCursor,
            prefix: folderName ? `${folderName}/` : undefined,
        };

        const response = await cloudinary.api.resources(searchOptions);

        return response.resources.map((resource) => ({
            id: resource.public_id,
            name: resource.public_id.split("/").pop(),
            size: resource.bytes,
            format: resource.format,
            createdAt: resource.created_at,
            url: resource.secure_url,
            resourceType: resource.resource_type,
            context: resource.context,
            tags: resource.tags,
        }));
    } catch (error) {
        logger.error(`List files failed: ${error.message}`);
        throw new Error(`Failed to list files: ${error.message}`);
    }
};

export const getStorageInfo = async () => {
    try {
        if (!initialized) await initCloudinary();

        const usage = await cloudinary.api.usage();

        return {
            plan: usage.plan,
            credits: {
                used: usage.credits?.used || 0,
                limit: usage.credits?.limit || 0,
            },
            storage: {
                used: usage.storage?.used || 0,
                limit: usage.storage?.limit || 0,
            },
            bandwidth: {
                used: usage.bandwidth?.used || 0,
                limit: usage.bandwidth?.limit || 0,
            },
            transformations: {
                used: usage.transformations?.used || 0,
                limit: usage.transformations?.limit || 0,
            },
            resources: usage.resources || 0,
            derived_resources: usage.derived_resources || 0,
        };
    } catch (error) {
        logger.error(`Failed to get storage info: ${error.message}`);
        throw new Error(`Failed to get storage info: ${error.message}`);
    }
};

export const searchFiles = async (searchQuery, options = {}) => {
    try {
        if (!initialized) await initCloudinary();

        const response = await cloudinary.search
            .expression(searchQuery)
            .max_results(options.limit || 100)
            .next_cursor(options.nextCursor)
            .sort_by("created_at", options.sortOrder || "desc")
            .with_field(["context", "tags"])
            .execute();

        return {
            resources: response.resources.map((resource) => ({
                id: resource.public_id,
                name: resource.public_id.split("/").pop(),
                size: resource.bytes,
                format: resource.format,
                createdAt: resource.created_at,
                url: resource.secure_url,
                resourceType: resource.resource_type,
                context: resource.context,
                tags: resource.tags,
                width: resource.width,
                height: resource.height,
            })),
            nextCursor: response.next_cursor,
            totalCount: response.total_count,
        };
    } catch (error) {
        logger.error(`Search files failed: ${error.message}`);
        throw new Error(`Failed to search files: ${error.message}`);
    }
};

export const bulkDelete = async (publicIds) => {
    try {
        if (!initialized) await initCloudinary();

        const response = await cloudinary.api.delete_resources(publicIds, {
            resource_type: "auto",
        });

        logger.info(`Bulk delete completed for ${publicIds.length} files`);
        return response;
    } catch (error) {
        logger.error(`Bulk delete failed: ${error.message}`);
        throw new Error(`Failed to bulk delete files: ${error.message}`);
    }
};
