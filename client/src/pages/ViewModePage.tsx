import Overlay from '../components/Overlay';
import ViewModePhoto from '../components/ViewMode/ViewModePhoto';
import * as api from '../ext/api';
import { useEffect, useState } from 'react';

interface Props {
  onMessage?: (s: string) => void;
}

export default function ViewModePage({ onMessage = () => {} }: Props) {
  const [photos, setPhotos] = useState<Array<UserPhoto>>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<React.Key | null>(
    null,
  );
  // Use an object to store tags, not a set. Set uses object equality so won't work for storing found tags.
  const [foundTags, setFoundTags] = useState<{ [key: string]: Tag }>({});

  const photo = photos.find(({ id }) => id === selectedPhotoId);
  const foundTagsCount = Object.keys(foundTags).length;

  function checkIfAllTagsFound() {
    if (photo && foundTagsCount === photo.tagCount) {
      // Congratulate the player.
      // Once player dismisses modal (or whatever it is), load a new image and clear foundTags.
    }
  }

  function onTagsFound(tags: Array<Tag>) {
    for (const tag of tags) {
      foundTags[tag.id.toString()] = tag;
    }
    setFoundTags(foundTags);
    checkIfAllTagsFound();
  }

  function getRandomPhoto(photos: Array<UserPhoto>) {
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
          <Overlay>
            {foundTagsCount}/{photo.tagCount.toString()} found
          </Overlay>
        </div>
      )}
    </>
  );
}
