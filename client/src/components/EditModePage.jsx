import PhotoList from './PhotoList';
import PhotoDetails from './PhotoDetails';
import AddPhotoForm from './AddPhotoForm';
import * as api from '../ext/api.admin.mjs';
import React, { useState, useEffect } from 'react';

export default function EditModePage() {
  const [photos, setPhotos] = useState(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  async function fetchPhotos() {
    const response = await api.fetchPhotosWithTags();
    if (response.ok) {
      const json = await response?.json();
      if (json.data?.photos) {
        setPhotos(json.data.photos);
      }
    }
  }

  // Fetch initial list.
  useEffect(() => {
    fetchPhotos();
  }, []);

  return (
    <>
      <h1>Photo Tagging App - Edit Mode</h1>
      <PhotoList
        photos={photos}
        onUploadPhoto={() => setIsUploadingPhoto(true)}
        onSelectPhoto={(photo) => {
          setIsUploadingPhoto(false);
          setSelectedPhotoId(photo.id);
        }}
      />
      {isUploadingPhoto ? (
        <AddPhotoForm onPostPhoto={fetchPhotos} />
      ) : (
        <PhotoDetails
          photo={photos?.find(({ id }) => id === selectedPhotoId)}
          onDelete={fetchPhotos}
        />
      )}
    </>
  );
}
