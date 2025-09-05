import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxLength: 100,
        },
        code: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            maxLength: 20,
        },
        branch: {
            type: String,
            required: true,
            enum: ["CSE", "ECE", "ME", "CE", "EEE", "IT", "AIDS", "AIML"],
        },
        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8,
        },
        credits: {
            type: Number,
            min: 1,
            max: 10,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

subjectSchema.index({ branch: 1, semester: 1 });

export const Subject = mongoose.model("Subject", subjectSchema);
