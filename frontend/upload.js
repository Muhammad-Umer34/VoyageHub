// uploadImage.js

import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

async function uploadImage() {
  const filePath = './src/assets/user.png';  
  const cloudName = 'dbslrfquo';
  const unsignedUploadPreset = 'Voyage_Hub';

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('upload_preset', unsignedUploadPreset);

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      { headers: formData.getHeaders() }
    );
    console.log('Upload success! URL:', res.data.secure_url);
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
  }
}

uploadImage();
