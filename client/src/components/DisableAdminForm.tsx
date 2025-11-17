import { postDisableAdmin } from '../ext/api.js';
import Form from '../styled/Form.js';
import FormError from '../styled/FormError.js';
import React, { useState } from 'react';

interface Props {
  onDisable?: Function;
}

export default function DisableAdminForm({ onDisable = () => {} }: Props) {
  const [msg, setMsg] = useState<string | null>(null);

  async function postForm(event: React.FormEvent) {
    try {
      event.preventDefault();
      const response = await postDisableAdmin();
      const json = await response?.json();
      setMsg(json.data.message);
      if (response.ok) onDisable();
    } catch (error: any) {
      console.error(error);
      setMsg(error.message);
    }
  }

  return (
    <Form onSubmit={postForm}>
      <button type="submit">Disable Admin Mode</button>
      {msg && <FormError aria-live="polite">{msg}</FormError>}
    </Form>
  );
}
