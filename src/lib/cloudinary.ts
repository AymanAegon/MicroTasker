import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'drmmom6jz', // Replace with your cloud name
  api_key: '979849212482131', // Replace with your API key
  api_secret: 'oSpF1WJkGcU86dPJjifRa_KxDFw', // Replace with your API secret
  secure: true,
});

export default cloudinary;
