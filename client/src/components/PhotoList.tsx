import PhotoListItem from './PhotoListItem';
import PaddedContainer from '../styled/PaddedContainer';
import ImportantButton from '../styled/ImportantButton';
import UnstyledList from '../styled/UnstyledList';
import React from 'react';
import styled from 'styled-components';

const HPaddedContainer = styled(PaddedContainer)`
  padding-top: 0;
  padding-bottom: 0;
`;

const PhotoListHeading = styled.h2`
  margin-top: 0;
`;

const MaxWidthImportantButton = styled(ImportantButton)`
  width: 100%;
`;

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
}: Readonly<Props>) {
  return (
    <div>
      <HPaddedContainer>
        <PhotoListHeading>Photos</PhotoListHeading>
      </HPaddedContainer>
      {photos && photos?.length !== 0 ? (
        <UnstyledList>
          {photos.map((photo) => (
            <li key={photo.id} onClick={() => onSelectPhoto(photo)}>
              <PhotoListItem
                photo={photo}
                isSelected={photo.id === selectedPhotoId}
              />
            </li>
          ))}
        </UnstyledList>
      ) : (
        <p>No photos found.</p>
      )}
      <PaddedContainer>
        <MaxWidthImportantButton type="button" onClick={onUploadPhoto}>
          New Photo
        </MaxWidthImportantButton>
      </PaddedContainer>
    </div>
  );
}
