import ViewModePhoto from '../components/ViewMode/ViewModePhoto';
import ViewWinModal from '../components/ViewMode/ViewWinModal';
import * as api from '../ext/api';
import { useEffect, useState } from 'react';

export default function ViewModePage() {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [timeToFinish, setTimeToFinish] = useState<number>(0);

  async function fetchRandomPhoto() {
    try {
      const response = await api.fetchRandomPhoto();
      const json = await response?.json();
      if (response.ok) {
        if (json.data?.photo) {
          setPhoto(json.data.photo);
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

  // Fetch a random photo on mount. Api will make sure this session doesn't get the same photo twice.
  useEffect(() => {
    fetchRandomPhoto();
  }, []);

  return (
    <>
      {photo && (
        // So modal can be placed absolutely.
        <div style={{ position: 'relative' }}>
          <ViewWinModal
            isActive={showWinModal}
            time={timeToFinish}
            onButtonClick={() => setShowWinModal(false)}
            onClose={() => {
              setShowWinModal(false);
              fetchRandomPhoto();
            }}
          />
          <ViewModePhoto
            photo={photo}
            onAllTagsFound={(ms: number) => {
              setTimeToFinish(ms);
              setShowWinModal(true);
            }}
          />
          {msg && <div>{msg}</div>}
        </div>
      )}
    </>
  );
}
