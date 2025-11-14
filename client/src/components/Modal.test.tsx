import Modal from './Modal';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
});

describe('Modal', () => {
  it('Displays when active', () => {
    render(
      <Modal isActive={true}>
        <h1>Test 1</h1>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
        <p>Some other stuff.</p>
      </Modal>,
    );

    expect(screen.queryByText('Test 1')).toBeInTheDocument();
    expect(screen.queryAllByText(/^Item/).length).toStrictEqual(3);
    expect(screen.queryByText('Some other stuff.')).toBeInTheDocument();
  });

  it('Does not display when not active', () => {
    // The rendering from the previous test seems to have 'stuck?'
    render(
      <Modal isActive={false}>
        <h1>My Modal</h1>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
        <p>Some other stuff.</p>
      </Modal>,
    );

    expect(screen.queryByText('Test 1')).not.toBeInTheDocument();
    expect(screen.queryAllByText(/^Item/).length).toStrictEqual(0);
    expect(screen.queryByText('Some other stuff.')).not.toBeInTheDocument();
  });
});
