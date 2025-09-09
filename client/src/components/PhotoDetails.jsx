import React from 'react';

export default function PhotoDetails({ photo }) {
  return (
    <>
      {photo ? (
        <h3>Photo Details Panel - {photo.id}</h3>
      ) : (
        <p>No photo selected.</p>
      )}
    </>
  );
}
