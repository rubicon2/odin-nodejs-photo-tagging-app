import PhotoListItem from './PhotoListItem';
import React from 'react';

// Show all photos, select individual photos to view, edit, and delete.
export default function PhotoList({ photos, onUploadPhoto, onSelectPhoto }) {
  return (
    <div>
      {photos && photos?.length !== 0 ? (
        <ul>
          {photos.map((photo) => (
            <li key={photo.id} onClick={() => onSelectPhoto(photo)}>
              <PhotoListItem photo={photo} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No photos found.</p>
      )}
      <button type="button" onClick={onUploadPhoto}>
        New Photo
      </button>
    </div>
  );
}
