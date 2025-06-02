const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Make sure we have the required environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary credentials in environment variables:', {
    CLOUDINARY_CLOUD_NAME: cloudName ? 'Found' : 'Missing',
    CLOUDINARY_API_KEY: apiKey ? 'Found' : 'Missing',
    CLOUDINARY_API_SECRET: apiSecret ? 'Found' : 'Missing'
  });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
  timeout: 60000 // Set timeout to 60 seconds
});

/**
 * Upload a file to Cloudinary with optimized settings
 * @param {string} filePath - The path to the file
 * @param {string} folder - The folder in Cloudinary to upload to
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder) => {
  try {
    console.log('Uploading to Cloudinary with credentials:', {
      cloud_name: cloudName ? 'Found' : 'Missing',
      api_key: apiKey ? 'Found' : 'Missing',
      api_secret: apiSecret ? 'Found' : 'Missing'
    });
    
    // Get file size to see if we should resize before upload
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    // Options for upload
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      timeout: 60000, // 60 seconds timeout
    };
    
    // If image is large, add transformation to reduce its size
    if (fileSizeInMB > 1) {
      uploadOptions.transformation = [
        { width: 1200, crop: "limit" }, // limit width to 1200px
        { quality: "auto:good" }        // optimize quality
      ];
    }
    
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    return {
      url: result.secure_url,
      public_id: result.public_id,
      asset_id: result.asset_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} public_id - The public ID of the file to delete
 * @returns {Promise<Object>} - The deletion result
 */
const deleteFromCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Fallback function to store files locally when Cloudinary fails
 * @param {string} sourcePath - The source path of the file
 * @param {string} productName - The name of the product for folder creation
 * @returns {string} - The public URL path to the stored file
 */
const storeFileLocally = (sourcePath, productName) => {
  try {
    const fileName = path.basename(sourcePath);
    const productDir = path.join(__dirname, '../public/Product', productName.replace(/\s+/g, '_'));
    
    // Create product directory if it doesn't exist
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }
    
    const destinationPath = path.join(productDir, fileName);
    
    // Copy the file to the destination
    fs.copyFileSync(sourcePath, destinationPath);
    
    // Return the URL path that can be used in frontend
    return `/Product/${productName.replace(/\s+/g, '_')}/${fileName}`;
  } catch (error) {
    console.error('Error storing file locally:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  storeFileLocally
};