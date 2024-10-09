const cloudinary = require('../config/configCloudinary');
const fs = require('fs');

const uploadImageToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder, 
        });
        fs.unlinkSync(filePath);
        return result.secure_url; 
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        throw error; 
    }
};

module.exports = uploadImageToCloudinary;
