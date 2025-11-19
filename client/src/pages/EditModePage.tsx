import PhotoList from '../components/PhotoList';
import EditPhotoDetails from '../components/EditMode/EditPhotoDetails.js';
import AddPhotoForm from '../components/EditMode/AddPhotoForm.js';
import * as api from '../ext/api.admin.js';
import { useState, useEffect } from 'react';

export default function EditModePage() {
  const [photos, setPhotos] = useState<Array<AdminPhoto>>([]);
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

  const selectedPhoto = photos?.find(({ id }) => id === selectedPhotoId);

  return (
    <>
      <PhotoList
        photos={photos}
        selectedPhotoId={selectedPhotoId}
        onUploadPhoto={() => {
          setIsUploadingPhoto(true);
          setSelectedPhotoId(null);
        }}
        onSelectPhoto={(photo: Photo) => {
          setIsUploadingPhoto(false);
          setSelectedPhotoId(photo.id);
        }}
      />
      {isUploadingPhoto ? (
        <AddPhotoForm onPostPhoto={fetchPhotos} />
      ) : (
        <>
          {selectedPhoto && (
            <EditPhotoDetails
              photo={selectedPhoto}
              onSave={fetchPhotos}
              onDelete={fetchPhotos}
            />
          )}
        </>
      )}
    </>
  );
}
