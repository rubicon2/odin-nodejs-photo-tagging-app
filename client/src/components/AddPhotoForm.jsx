import * as api from '../ext/api.admin.mjs';
import React, { useState } from 'react';

export default function AddPhotoForm({ onPostPhoto }) {
  const [msg, setMsg] = useState(null);

  async function postPhoto(event) {
    event.preventDefault();
    try {
      const response = await api.postPhoto(event);
      if (response.ok) {
        const json = await response.json();
        if (json.data?.message) {
          setMsg(json.data.message);
        }
      }
      onPostPhoto();
    } catch (error) {
      setMsg(error.message);
    }
  }

  return (
    <form onSubmit={postPhoto}>
      <input type="file" name="photo" required />
      <input type="text" name="altText" required />
      {/* How to do multiple tags - positions and names? */}
      <button type="submit">Submit</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
