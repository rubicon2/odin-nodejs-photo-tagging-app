import Form from '../../styled/Form.js';
import FormError from '../../styled/FormError.js';
import ImportantButton from '../../styled/ImportantButton.js';
import * as api from '../../ext/api.admin.js';
import * as breakpoints from '../../breakpoints';
import React, { useState } from 'react';
import styled from 'styled-components';

const ImportantButtonReactive = styled(ImportantButton)`
  @media (min-width: ${breakpoints.tablet}) {
    justify-self: end;
  }
`;

interface Props {
  onPostPhoto?: Function;
}

export default function AddPhotoForm({ onPostPhoto = () => {} }: Props) {
  const [msg, setMsg] = useState<string | null>(null);

  async function postPhoto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await api.postPhoto(new FormData(event.currentTarget));
      const json = await response.json();
      if (!response.ok) {
        if (json.data?.message) {
          setMsg(json.data.message);
        }
      }
      onPostPhoto();
    } catch (error: any) {
      setMsg(error.message);
    }
  }

  return (
    <Form onSubmit={postPhoto}>
      <label htmlFor="photo">
        Photo:
        <input type="file" name="photo" required />
      </label>
      <label htmlFor="altText">
        Title:
        <input type="text" name="altText" required />
      </label>
      {msg && <FormError>{msg}</FormError>}
      <ImportantButtonReactive type="submit">Submit</ImportantButtonReactive>
    </Form>
  );
}
