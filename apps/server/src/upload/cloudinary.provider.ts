import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: 'dth3letd8', 
      api_key: '695478183324266',
      api_secret: 'vIm4oMn6U44KgZczLuVAsTm19dc',
    });
  },
};