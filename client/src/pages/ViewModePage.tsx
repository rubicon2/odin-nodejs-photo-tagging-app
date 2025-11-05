import Overlay from '../components/Overlay';
import ViewModePhoto from '../components/ViewModePhoto';
import * as api from '../ext/api';
import { useEffect, useState } from 'react';

interface Props {
  onMessage?: (s: string) => void;
}

export default function ViewModePage({ onMessage = () => {} }: Props) {
  const [photos, setPhotos] = useState<Array<Photo>>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<React.Key | null>(
    null,
  );
  // Use an object to store tags, not a set. Set uses object equality so won't work for storing found tags.
  const [foundTags, setFoundTags] = useState<{ [key: string]: Tag }>({});

  function onTagsFound(tags: Array<Tag>) {
    for (const tag of tags) {
      foundTags[tag.id.toString()] = tag;
    }
    setFoundTags(foundTags);
    // Check if all tags are found. However photos do not include total number of tags yet.
    // Need to change server to give tag count on non-admin route (may as well put on admin route too though).
  }

  function getRandomPhoto(photos: Array<Photo>) {
    const random = Math.floor(Math.random() * photos.length);
    return photos[random];
  }

  async function fetchPhotos() {
    try {
      const response = await api.fetchPhotos();
      const json = await response?.json();
      if (response.ok) {
        if (json.data?.photos) {
          setPhotos(json.data.photos);
        }
      } else {
        if (json.data?.message) {
          console.log(json.data.message);
          onMessage(json.data.message);
        }
      }
    } catch (error: any) {
      console.error(error.message);
      onMessage(error.message);
    }
  }

  // Fetch initial list, without tags.
  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    // Once photos have been populated, get a random one!
    if (!selectedPhotoId) {
      const photo = getRandomPhoto(photos);
      if (photo) setSelectedPhotoId(photo.id);
    }
  }, [photos]);

  const photo = photos.find(({ id }) => id === selectedPhotoId);

  return (
    <>
      {photo && (
        // So overlay is positioned relative to image, not whole page.
        <div style={{ position: 'absolute' }}>
          <ViewModePhoto
            photo={photo}
            onNoTagsFound={() => console.log('No tags!')}
            onTagsFound={onTagsFound}
          />
          <Overlay>My Overlaid Text!</Overlay>
        </div>
      )}
    </>
  );
}
