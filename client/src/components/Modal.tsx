import React from 'react';

interface Props {
  isActive: Boolean;
  children: React.ReactNode;
}

// When the application gets styled, this will cover the whole screen,
// and fade in and out when it is set to active or inactive.
export default function Modal({ isActive = false, children }: Props) {
  return <>{isActive && <div>{children}</div>}</>;
}
