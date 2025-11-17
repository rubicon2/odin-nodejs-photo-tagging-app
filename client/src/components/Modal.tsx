import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import closeIcon from '../img/icons/close_48_light.svg';

const Dialog = styled.dialog`
  padding: 3rem;
  border: 0px;
  border-radius: 10px;
  box-shadow: 3px 3px 20px rgba(0, 0, 0, 0.25);

  &::backdrop {
    background-color: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(2px);
  }
`;

const Form = styled.form`
  position: absolute;
  top: 0px;
  right: 0px;
`;

const CloseIcon = styled.img`
  display: block;
  width: 25px;
  height: 25px;
`;

interface Props {
  isActive: Boolean;
  children?: React.ReactNode;
  onClose?: (this: HTMLDialogElement, ev: Event) => void;
}

// When the application gets styled, this will cover the whole screen,
// and fade in and out when it is set to active or inactive.
export default function Modal({
  isActive = false,
  children,
  onClose = () => {},
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isActive) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [isActive]);

  useEffect(() => {
    dialog.current?.addEventListener('close', onClose);
    return () => dialog.current?.removeEventListener('close', onClose);
  }, [dialog.current]);

  return (
    <>
      <Dialog ref={dialog}>
        <div>
          {children}
          <Form method="dialog">
            <button type="submit">
              <CloseIcon src={closeIcon} alt="close modal" />
            </button>
          </Form>
        </div>
      </Dialog>
    </>
  );
}
