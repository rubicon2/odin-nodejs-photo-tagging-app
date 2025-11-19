import PhotoList from '../components/PhotoList';
import EditPhotoDetails from '../components/EditMode/EditPhotoDetails.js';
import AddPhotoForm from '../components/EditMode/AddPhotoForm.js';
import PaddedContainer from '../styled/PaddedContainer.js';
import * as api from '../ext/api.admin.js';
import { useState, useEffect } from 'react';
import styled from 'styled-components';

const AddPhotoFormContainer = styled(PaddedContainer)`
  padding-top: 0;
`;

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
        const photos: Array<AdminPhoto> = json.data.photos;
        photos.sort((a, b) => a.altText.localeCompare(b.altText));
        setPhotos(photos);
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
        <AddPhotoFormContainer>
          <AddPhotoForm onPostPhoto={fetchPhotos} />
        </AddPhotoFormContainer>
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
