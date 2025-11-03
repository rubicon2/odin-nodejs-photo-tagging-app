import { postEnableAdmin } from '../ext/api.mjs';
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
      const response = await postEnableAdmin(password);
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
