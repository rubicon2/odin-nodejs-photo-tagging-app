import { useState, useLayoutEffect } from 'react';

export default function useElementSize(
  ref: React.RefObject<HTMLElement | null>,
): Pos {
  const [elementSize, setElementSize] = useState<Pos>({ x: 0, y: 0 });

  function handleChange(currentTarget: HTMLElement) {
    const boundingClientRect = currentTarget.getBoundingClientRect();
    setElementSize({
      x: boundingClientRect.width,
      y: boundingClientRect.height,
    });
  }

  useLayoutEffect(() => {
    function refreshElementSize() {
      if (!ref.current) return;
      handleChange(ref.current);
    }

    // In case element needs to load from server, e.g. an image.
    // If refresh size happens before load, size will be zero.
    if (ref.current) ref.current.addEventListener('load', refreshElementSize);
    window.addEventListener('resize', refreshElementSize);
    return () => {
      if (ref.current)
        ref.current.removeEventListener('load', refreshElementSize);
      window.removeEventListener('resize', refreshElementSize);
    };
  }, []);

  return elementSize;
}
