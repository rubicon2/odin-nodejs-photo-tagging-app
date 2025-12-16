import ViewWinTimeFormFields from './ViewWinTimeFormFields';
import Form from '../../styled/Form';
import FormError from '../../styled/FormError';
import ImportantButton from '../../styled/ImportantButton';
import * as api from '../../ext/api';
import { useState } from 'react';

interface Props {
  onFormSubmit?: () => any;
}

export default function ViewWinTimeForm({ onFormSubmit = () => {} }: Props) {
  const [name, setName] = useState<string>('');
  const [msg, setMsg] = useState<string | null>(null);

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      // Submit time to the server.
      const name = new FormData(event.currentTarget).get('name');
      const response = await api.postPhotoTime(name as string);
      const json = await response?.json();
      if (response.ok) {
        setMsg('Time submitted!');
        // Fetch a new image.
        onFormSubmit();
      } else {
        setMsg(json.data.message);
      }
    } catch (error: any) {
      setMsg(error.message);
    }
  }

  return (
    <Form onSubmit={handleFormSubmit}>
      <ViewWinTimeFormFields
        name={name}
        onChange={(e) => setName(e.currentTarget.value)}
      />
      <ImportantButton type="submit">
        Submit Time and Get New Image
      </ImportantButton>
      {msg && <FormError aria-live="polite">{msg}</FormError>}
    </Form>
  );
}
