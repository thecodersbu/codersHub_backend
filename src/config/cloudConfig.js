import dotenv from 'dotenv';

dotenv.config();

export const cloudConfig = {
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || '',
        folderName: process.env.CLOUDINARY_FOLDER || 'campushub-resources',
        maxFileSize: 100 * 1024 * 1024, // 100MB
        allowedMimeTypes: ['application/pdf'],
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'campushub_preset'
    }
};


const validateConfig = () => {
    const { cloudName, apiKey, apiSecret } = cloudConfig.cloudinary;
    
    if (!cloudName) {
        throw new Error('CLOUDINARY_CLOUD_NAME environment variable is required');
    }
    if (!apiKey) {
        throw new Error('CLOUDINARY_API_KEY environment variable is required');
    }
    if (!apiSecret) {
        throw new Error('CLOUDINARY_API_SECRET environment variable is required');
    }
};

validateConfig();
