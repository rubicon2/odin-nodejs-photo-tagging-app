import { postEnableAdmin } from '../ext/api.js';
import React from 'react';

interface Props {
  onEnable?: Function;
  onMessage?: Function;
}

export default function EnableAdminForm({
  onEnable = () => {},
  onMessage = () => {},
}: Props) {
  async function postForm(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      const password = new FormData(event.currentTarget).get('password');
      if (!password) throw new Error('Please enter a password');
      const response = await postEnableAdmin(password.toString());
      const json = await response?.json();
      onMessage(json.data.message);
      if (response.ok) onEnable();
    } catch (error: any) {
      console.error(error);
      onMessage(error.message);
    }
  }

  return (
    <form onSubmit={postForm}>
      <label htmlFor="password">
        Password:
        <input type="password" name="password" required />
        <button type="submit">Enable Admin Mode</button>
      </label>
    </form>
  );
}
