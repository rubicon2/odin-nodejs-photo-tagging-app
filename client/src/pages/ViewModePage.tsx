import ViewModePhoto from '../components/ViewMode/ViewModePhoto';
import ViewWinModal from '../components/ViewMode/ViewWinModal';
import * as api from '../ext/api';
import { useEffect, useState } from 'react';

export default function ViewModePage() {
  const [photo, setPhoto] = useState<UserPhoto | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);

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

  function startNewRound() {
    fetchRandomPhoto();
  }

  // Fetch a random photo. Api will make sure this session doesn't get the same photo twice.
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
            onClose={() => {
              setShowWinModal(false);
              startNewRound();
            }}
          />
          <ViewModePhoto
            photo={photo}
          />
          {msg && <div>{msg}</div>}
        </div>
      )}
    </>
  );
}
