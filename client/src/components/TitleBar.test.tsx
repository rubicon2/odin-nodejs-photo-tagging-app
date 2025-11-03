import TitleBar from './TitleBar';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import React from 'react';

afterEach(() => {
  cleanup();
});

describe('TitleBar', () => {
  it('Displays the title of the application', () => {
    render(<TitleBar />);

    expect(screen.queryByText("Where's Waldo?")).toBeInTheDocument();
  });

  it('Calls onSettingsClick handler when the settings button is clicked', async () => {
    let isAdminEnabled = false;

    const clickHandler = vi.fn(() => (isAdminEnabled = !isAdminEnabled));

    render(
      <TitleBar
        isAdminEnabled={isAdminEnabled}
        onSettingsClick={clickHandler}
      />,
    );

    await userEvent.click(screen.getByRole('button'));
    expect(isAdminEnabled).toStrictEqual(true);

    await userEvent.click(screen.getByRole('button'));
    expect(isAdminEnabled).toStrictEqual(false);
  });
});
