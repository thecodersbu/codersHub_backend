import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
    {
        branch: {
            type: String,
            required: true,
            enum: ["CSE", "ECE", "ME", "CE", "EEE", "IT", "AIDS", "AIML"],
            index: true,
        },
        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8,
            index: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxLength: 100,
            index: true,
        },
        resourceType: {
            type: String,
            required: true,
            enum: ["pyq", "notes", "syllabus", "content"],
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxLength: 200,
        },
        description: {
            type: String,
            trim: true,
            maxLength: 1000,
        },

        fileUrl: {
            type: String,
            validate: {
                validator: function (v) {
                    return (
                        this.resourceType === "syllabus" ||
                        this.resourceType === "content" ||
                        v
                    );
                },
                message: "File URL is required for PDF resources",
            },
        },
        fileId: {
            type: String,
            validate: {
                validator: function (v) {
                    return (
                        this.resourceType === "syllabus" ||
                        this.resourceType === "content" ||
                        v
                    );
                },
                message: "File ID is required for PDF resources",
            },
        },
        fileName: String,
        fileSize: Number,

        syllabusText: {
            type: String,
            validate: {
                validator: function (v) {
                    return (
                        this.resourceType !== "syllabus" || (v && v.length > 0)
                    );
                },
                message: "Syllabus text is required for syllabus resources",
            },
        },

        contentLink: {
            type: String,
            validate: {
                validator: function (v) {
                    if (this.resourceType === "content") {
                        return /^https?:\/\/.+/.test(v);
                    }
                    return true;
                },
                message: "Valid URL is required for content resources",
            },
        },

        uploadedBy: {
            type: String,
            required: true,
            default: "admin",
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        downloadCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    },
);

resourceSchema.index({ branch: 1, semester: 1, subject: 1 });
resourceSchema.index({ resourceType: 1, isActive: 1 });
resourceSchema.index({ createdAt: -1 });

resourceSchema.index({
    title: "text",
    description: "text",
    subject: "text",
    tags: "text",
});

resourceSchema.pre("save", function (next) {
    if (this.isModified()) {
        this.updatedAt = new Date();
    }
    next();
});

export const Resource = mongoose.model("Resource", resourceSchema);
