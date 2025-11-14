import ViewModePhoto from '../components/ViewMode/ViewModePhoto';
import ViewWinModal from '../components/ViewMode/ViewWinModal';
import * as api from '../ext/api';
import { useEffect, useState, useRef } from 'react';

export default function ViewModePage() {
  const [photos, setPhotos] = useState<Array<UserPhoto>>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<React.Key | null>(
    null,
  );

  // So all callbacks can have the latest value regardless of render cycles.
  const selectedPhotoIdRef = useRef<React.Key | null>(selectedPhotoId);
  const completedPhotoIdsRef = useRef<Array<string>>([]);

  const [foundTags, setFoundTags] = useState<Array<Tag>>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);

  const photo = photos.find(({ id }) => id === selectedPhotoId);

  function checkIfAllTagsFound() {
    if (photo && foundTags.length === photo.tagCount) {
      setTimeout(() => {
        if (selectedPhotoIdRef.current) {
          completedPhotoIdsRef.current.push(
            selectedPhotoIdRef.current as string,
          );
        }
        setShowWinModal(true);
      }, 1000);
    }
  }

  function startNewGame() {
    // Avoid the last photo in one game from being the first in the next.
    completedPhotoIdsRef.current = [selectedPhotoIdRef.current as string];
    startNewRound();
  }

  function startNewRound() {
    setFoundTags([]);
    // If there are any uncompleted photos, start a new round with that.
    const nextPhoto = getRandomUncompletedPhoto();
    if (nextPhoto) {
      selectedPhotoIdRef.current = nextPhoto.id;
      setSelectedPhotoId(nextPhoto.id);
    }
    // Otherwise, clear out completed photos and start again.
    else startNewGame();
  }

  function getRandomUncompletedPhoto() {
    const uncompletedPhotos = photos.filter(
      (photo) => !completedPhotoIdsRef.current.includes(photo.id as string),
    );
    const random = Math.floor(Math.random() * uncompletedPhotos.length);
    return uncompletedPhotos[random];
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
          setMsg(json.data.message);
        }
      }
    } catch (error: any) {
      console.error(error.message);
      setMsg(error.message);
    }
  }

  // Fetch initial list, without tags.
  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    // Once photos have been populated, get a random one!
    if (!selectedPhotoId) {
      const photo = getRandomUncompletedPhoto();
      if (photo) {
        selectedPhotoIdRef.current = photo.id;
        setSelectedPhotoId(photo.id);
      }
    }
  }, [photos]);

  useEffect(() => {
    // Has to be here and not in event handler for onTagsFound,
    // since the handler will be using foundTags from the current render,
    // it won't include the latest tag that was found (i.e. a stale value).
    // This effect will be triggered on the next render, so foundTags will be up to date.
    checkIfAllTagsFound();
  }, [foundTags]);

  return (
    <>
      {photo && (
        // So modal can be placed absolutely.
        <div style={{ position: 'relative' }}>
          <ViewWinModal
            isActive={showWinModal}
            onClose={() => {
              setShowWinModal(false);
              startNewRound();
            }}
          />
          <ViewModePhoto
            photo={photo}
            foundTags={foundTags}
            onTagsFound={(tags) => setFoundTags([...foundTags, ...tags])}
          />
          {msg && <div>{msg}</div>}
        </div>
      )}
    </>
  );
}
