import Form from '../styled/Form';
import FormError from '../styled/FormError';
import ImportantButton from '../styled/ImportantButton';
import { postDisableAdmin } from '../ext/api';
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
      <ImportantButton type="submit">Disable Admin Mode</ImportantButton>
      {msg && <FormError aria-live="polite">{msg}</FormError>}
    </Form>
  );
}
