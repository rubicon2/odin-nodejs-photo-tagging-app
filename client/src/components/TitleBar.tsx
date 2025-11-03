import React from 'react';

interface Props {
  isAdminEnabled?: Boolean;
  onSettingsClick?: React.MouseEventHandler;
}

export default function TitleBar({
  isAdminEnabled = false,
  onSettingsClick = () => {},
}: Props) {
  return (
    <header>
      <h1>Where&apos;s Waldo?</h1>
      <button onClick={onSettingsClick}>
        {isAdminEnabled ? 'Disable Admin' : 'Enable Admin'}
      </button>
    </header>
  );
}
