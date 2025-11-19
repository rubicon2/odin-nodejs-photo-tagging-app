import PhotoListItem from './PhotoListItem';
import ImportantButton from '../styled/ImportantButton';
import React from 'react';

interface Props {
  photos: Array<Photo>;
  selectedPhotoId: React.Key | null;
  onUploadPhoto?: React.MouseEventHandler;
  onSelectPhoto?: Function;
}

// Show all photos, select individual photos to view, edit, and delete.
export default function PhotoList({
  photos,
  selectedPhotoId,
  onUploadPhoto = () => {},
  onSelectPhoto = () => {},
}: Props) {
  return (
    <div>
      {photos && photos?.length !== 0 ? (
        <ul>
          {photos.map((photo) => (
            <li key={photo.id} onClick={() => onSelectPhoto(photo)}>
              <PhotoListItem
                photo={photo}
                isSelected={photo.id === selectedPhotoId}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>No photos found.</p>
      )}
      <ImportantButton type="button" onClick={onUploadPhoto}>
        New Photo
      </ImportantButton>
    </div>
  );
}
