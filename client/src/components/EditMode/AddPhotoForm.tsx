import Form from '../../styled/Form';
import FormError from '../../styled/FormError';
import ImportantButton from '../../styled/ImportantButton';
import ValidatedInput from '../ValidatedInput';
import * as api from '../../ext/api.admin';
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
        <ValidatedInput
          type="file"
          name="photo"
          required
          validationMsgFn={(v) => {
            if (v.valueMissing) return 'Photo is a required field';
            else return null;
          }}
        />
      </label>
      <label htmlFor="altText">
        Title:
        <ValidatedInput
          type="text"
          name="altText"
          required
          validationMsgFn={(v) => {
            if (v.valueMissing) return 'AltText is a required field';
            else return null;
          }}
        />
      </label>
      {msg && <FormError>{msg}</FormError>}
      <ImportantButtonReactive type="submit">Submit</ImportantButtonReactive>
    </Form>
  );
}
