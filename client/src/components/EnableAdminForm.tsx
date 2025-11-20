import { postEnableAdmin } from '../ext/api.js';
import Form from '../styled/Form.js';
import FormError from '../styled/FormError.js';
import ImportantButton from '../styled/ImportantButton.js';
import React, { useState } from 'react';

interface Props {
  onEnable?: Function;
  onMessage?: Function;
}

export default function EnableAdminForm({ onEnable = () => {} }: Props) {
  const [msg, setMsg] = useState<string | null>(null);

  async function postForm(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      const password = new FormData(event.currentTarget).get('password');
      if (!password) throw new Error('Please enter a password');
      const response = await postEnableAdmin(password.toString());
      const json = await response?.json();
      setMsg(json.data.message);
      if (response.ok) onEnable();
    } catch (error: any) {
      console.error(error);
      setMsg(error.message);
    }
  }

  return (
    <Form onSubmit={postForm}>
      <div>
        <label htmlFor="password">
          Password:
          <input type="password" name="password" id="password" required />
        </label>
        {msg && <FormError aria-live="polite">{msg}</FormError>}
      </div>
      <ImportantButton type="submit" title="Submit form">
        Enable Admin Mode
      </ImportantButton>
    </Form>
  );
}
