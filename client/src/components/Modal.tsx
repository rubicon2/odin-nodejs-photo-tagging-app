import React, { useEffect, useRef } from 'react';

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
      <dialog ref={dialog}>
        {children}
        <form method="dialog">
          <button type="submit">Close</button>
        </form>
      </dialog>
    </>
  );
}
