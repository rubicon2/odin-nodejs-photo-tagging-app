import PhotoList from '../components/PhotoList';
import PhotoDetails from '../components/PhotoDetails';
import AddPhotoForm from '../components/AddPhotoForm';
import * as api from '../ext/api.admin.js';
import { useState, useEffect } from 'react';

export default function EditModePage() {
  const [photos, setPhotos] = useState<Array<Photo>>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<null | React.Key>(
    null,
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<Boolean>(false);

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
      <PhotoList
        photos={photos}
        onUploadPhoto={() => setIsUploadingPhoto(true)}
        onSelectPhoto={(photo: Photo) => {
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
