import * as api from '../ext/api.admin.js';
import React, { useState } from 'react';

interface Props {
  photo?: Photo;
  onDelete?: Function;
}

// Be able to edit tags and altText, and delete.
export default function PhotoDetails({ photo, onDelete = () => {} }: Props) {
  const [msg, setMsg] = useState(null);

  async function deletePhoto(event: React.MouseEvent) {
    try {
      if (!photo) return;
      event.preventDefault();
      const response = await api.deletePhoto(photo.id.toString());
      if (response.ok) {
        const json = await response?.json();
        if (json.data?.message) {
          setMsg(json.data.message);
        }
        onDelete();
      }
    } catch (error: any) {
      setMsg(error.message);
    }
  }

  return (
    <>
      {photo ? (
        <>
          <h3>Photo Details Panel - {photo.id}</h3>
          <img src={photo.url} />
          <button type="button" onClick={deletePhoto}>
            Delete
          </button>
        </>
      ) : (
        <p>No photo selected.</p>
      )}
      {msg && <p>{msg}</p>}
    </>
  );
}
