import useDarkThemeActive from '../hooks/useDarkThemeActive';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import closeIconLight from '../img/icons/close_48_light.svg';
import closeIconDark from '../img/icons/close_48_dark.svg';

const Dialog = styled.dialog`
  padding: 3rem;
  border: 0px;
  border-radius: 10px;
  box-shadow: 3px 3px 20px rgba(0, 0, 0, 0.25);

  &::backdrop {
    background-color: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(2px);
  }

  @media (prefers-color-scheme: dark) {
    box-shadow: 3px 3px 20px rgba(0, 0, 0, 0.5);

    &::backdrop {
      background-color: rgba(255, 255, 255, 0.25);
    }
  }
`;

const Form = styled.form`
  position: absolute;
  top: 0px;
  right: 0px;
`;

const CloseButton = styled.button`
  display: grid;
  place-items: center;
  padding: 10px;
  background-color: transparent;
  width: 60px;
  height: 60px;
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
  ...props
}: Props & React.HTMLProps<HTMLDialogElement>) {
  const dialog = useRef<HTMLDialogElement>(null);
  const isDarkThemeActive = useDarkThemeActive();

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
    <Dialog ref={dialog} {...props}>
      <Form method="dialog">
        <CloseButton type="submit" title="Close modal">
          <img
            src={isDarkThemeActive ? closeIconDark : closeIconLight}
            alt=""
          />
        </CloseButton>
      </Form>
      <div>{children}</div>
    </Dialog>
  );
}
