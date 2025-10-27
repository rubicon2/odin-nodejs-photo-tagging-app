import React, { useState } from 'react';

// Be able to edit tags and altText, and delete.
export default function PhotoDetails({ photo, onDelete }) {
  const [msg, setMsg] = useState(null);

  async function deletePhoto(event) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/admin/photo/${photo.id}`,
        {
          method: 'delete',
        },
      );
      if (response.ok) {
        const json = await response?.json();
        if (json.data?.message) {
          setMsg(json.data.message);
        }
        onDelete();
      }
    } catch (error) {
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
