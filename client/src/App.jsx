import React from 'react';
import { useState } from 'react';
import './App.css';

function App() {
  const [msg, setMsg] = useState(null);
  const [image, setImage] = useState(null);
  const [files, setFiles] = useState(null);

  async function hitServer(event) {
    event.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1`);
      if (response.ok) {
        const json = await response.json();
        if (json.data?.message) {
          setMsg(json.data.message);
        }
      }
    } catch (error) {
      setMsg(error.message);
    }
  }

  async function getPhotoIndex(event) {
    event.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/photo`,
      );
      if (response.ok) {
        const json = await response.json();
        if (json.data?.message) {
          setMsg(json.data.message);
        }
        if (json.data?.files) {
          setFiles(json.data.files);
        }
      }
    } catch (error) {
      setMsg(error.message);
    }
  }

  async function postPhoto(event) {
    event.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/photo`,
        {
          method: 'post',
          body: new FormData(event.target),
        },
      );
      if (response.ok) {
        const json = await response.json();
        if (json.data?.message) {
          setMsg(json.data.message);
        }
        if (json.data?.image) {
          setImage(json.data.image);
        }
      }
    } catch (error) {
      setMsg(error.message);
    }
  }

  return (
    <>
      <h1>Photo Tagging App</h1>
      <div className="card">
        <button onClick={hitServer}>Hit Dat Server</button>
        <button onClick={getPhotoIndex}>Get Photo Index</button>
        <form onSubmit={postPhoto} encType="multipart/form-data">
          <legend>Upload Photo</legend>
          <input type="file" name="image" required />
          <input type="text" name="altText" required />
          <button>Post Photo</button>
        </form>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      {msg && <p>{msg}</p>}
      {image && (
        <img src={image.url} alt={image.altText} />
      )}
      {files && (
        <ul>
          {files.map((file) => (
            <li key={file}>{file}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export default App;
