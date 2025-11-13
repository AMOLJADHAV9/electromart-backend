import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfig } from '../config/index';

// Configure Cloudinary only if credentials are provided and not placeholders
let isConfigured = false;
if (cloudinaryConfig.cloudName && 
    cloudinaryConfig.cloudName !== 'your_cloud_name' &&
    cloudinaryConfig.apiKey && 
    cloudinaryConfig.apiKey !== '123456789012345' &&
    cloudinaryConfig.apiSecret && 
    cloudinaryConfig.apiSecret !== 'abcdefghijklmnopqrstuvwxyz123456') {
  try {
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
    });
    isConfigured = true;
    console.log('✅ Cloudinary configured successfully');
  } catch (error) {
    console.error('❌ Failed to configure Cloudinary:', error);
    console.warn('⚠️  Cloudinary functionality will be disabled');
  }
} else {
  console.warn('⚠️  Cloudinary configuration not found or using placeholder values. Image management functionality will be disabled.');
}

// Cloudinary service functions
export const cloudinaryService = {
  // Upload an image to Cloudinary
  async uploadImage(fileBuffer: Buffer, fileName: string, folder: string = 'products') {
    // Check if Cloudinary is configured
    if (!isConfigured) {
      throw new Error('Cloudinary is not configured. Please set valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
    }
    
    try {
      // Convert to promise-based approach
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            public_id: fileName,
            use_filename: true,
            unique_filename: false,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        // Write the buffer to the upload stream
        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  },

  // Delete an image from Cloudinary
  async deleteImage(publicId: string) {
    // Check if Cloudinary is configured
    if (!isConfigured) {
      throw new Error('Cloudinary is not configured. Please set valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
    }
    
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw error;
    }
  },

  // Get image details
  async getImageDetails(publicId: string) {
    // Check if Cloudinary is configured
    if (!isConfigured) {
      throw new Error('Cloudinary is not configured. Please set valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
    }
    
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('Error getting image details from Cloudinary:', error);
      throw error;
    }
  },

  // Create a transformation URL
  createTransformedImageUrl(publicId: string, transformations: any = {}) {
    // Check if Cloudinary is configured
    if (!isConfigured) {
      throw new Error('Cloudinary is not configured. Please set valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
    }
    
    try {
      return cloudinary.url(publicId, transformations);
    } catch (error) {
      console.error('Error creating transformed image URL:', error);
      throw error;
    }
  },
  
  // Check if Cloudinary is properly configured
  isConfigured(): boolean {
    return isConfigured;
  }
};