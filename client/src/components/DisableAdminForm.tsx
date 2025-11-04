import { postDisableAdmin } from '../ext/api.js';
import React from 'react';

interface Props {
  onDisable?: Function;
  onMessage?: Function;
}

export default function DisableAdminForm({
  onDisable = () => {},
  onMessage = () => {},
}: Props) {
  async function postForm(event: React.FormEvent) {
    try {
      event.preventDefault();
      const response = await postDisableAdmin();
      const json = await response?.json();
      onMessage(json.data.message);
      if (response.ok) onDisable();
    } catch (error: any) {
      console.error(error);
      onMessage(error.message);
    }
  }

  return (
    <form onSubmit={postForm}>
      <button type="submit">Disable Admin Mode</button>
    </form>
  );
}
