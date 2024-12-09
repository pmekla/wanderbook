const CLOUD_NAME = 'dhqfxaclm';
const UPLOAD_PRESET = 'wanderbook_images';

export const cloudinaryUpload = async (photo) => {
  const data = new FormData();
  data.append('file', {
    uri: photo,
    type: 'image/jpeg',
    name: 'upload.jpg'
  });
  data.append('upload_preset', UPLOAD_PRESET);
  data.append('cloud_name', CLOUD_NAME);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      {
        method: 'post',
        body: data
      }
    );
    const responseData = await response.json();
    return responseData.secure_url;
  } catch (err) {
    console.error('Upload error:', err);
    return null;
  }
};
