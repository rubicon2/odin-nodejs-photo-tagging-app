import React from 'react';
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState(null);
  const [image, setImage] = useState(null);

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

  async function getPhoto(event) {
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
        if (json.data?.image) {
          setImage(json.data.image);
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

  async function deletePhoto(event) {
    event.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/photo`,
        {
          method: 'delete',
          body: new URLSearchParams(new FormData(event.target)),
        },
      );
      if (response.ok) {
        const json = await response?.json();
        if (json?.data?.message) {
          setMsg(json.data.message);
        }
      }
    } catch (error) {
      setMsg(error.message);
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={hitServer}>Hit Dat Server</button>
        <button onClick={getPhoto}>Get Photo</button>
        <form onSubmit={postPhoto} encType="multipart/form-data">
          <legend>Upload Photo</legend>
          <input type="file" name="image" required />
          <input type="text" name="test" />
          <button>Post Photo</button>
        </form>
        <form onSubmit={deletePhoto}>
          <input type="text" name="filepath" required />
          <button>Delete Photo</button>
        </form>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      {msg && <p>{msg}</p>}
      {image && <img src={image.url} />}
    </>
  );
}

export default App;
