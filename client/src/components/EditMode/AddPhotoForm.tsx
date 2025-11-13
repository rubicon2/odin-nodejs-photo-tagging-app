import * as api from '../../ext/api.admin.js';
import React, { useState } from 'react';

interface Props {
  onPostPhoto?: Function;
}

export default function AddPhotoForm({ onPostPhoto = () => {} }: Props) {
  const [msg, setMsg] = useState(null);

  async function postPhoto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await api.postPhoto(new FormData(event.currentTarget));
      if (response.ok) {
        const json = await response.json();
        if (json.data?.message) {
          setMsg(json.data.message);
        }
      }
      onPostPhoto();
    } catch (error: any) {
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
