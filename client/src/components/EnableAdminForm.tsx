import Form from '../styled/Form';
import FormError from '../styled/FormError';
import ImportantButton from '../styled/ImportantButton';
import ValidatedInput from './ValidatedInput';
import { postEnableAdmin } from '../ext/api';
import React, { useState } from 'react';
import styled from 'styled-components';

const FormErrorCentered = styled(FormError)`
  text-align: center;
`;

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
          <ValidatedInput
            type="password"
            name="password"
            id="password"
            required
            validationMsgFn={(validity: ValidityState) => {
              if (validity.valueMissing) {
                return 'Password is a required field';
              } else return null;
            }}
          />
        </label>
      </div>
      <FormErrorCentered aria-live="polite">{msg}</FormErrorCentered>
      <ImportantButton type="submit" title="Submit form">
        Enable Admin Mode
      </ImportantButton>
    </Form>
  );
}
