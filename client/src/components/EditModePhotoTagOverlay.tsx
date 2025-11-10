import Overlay from './Overlay';
import { useLayoutEffect, useRef, useState } from 'react';

interface Props {
  tag: EditableTag;
  imgSize: Pos;
}

export default function EditModePhotoTagOverlay({ tag, imgSize }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Pos>({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    setSize({
      x: bounds.width,
      y: bounds.height,
    });
  }, []);

  return (
    <Overlay
      ref={ref}
      xPos={`${tag.posX * imgSize.x - size.x / 2}px`}
      yPos={`${tag.posY * imgSize.y - size.y / 2}px`}
    >
      <span
        style={{
          color: 'white',
          // Scale text with image - don't use vw since once image
          // reaches min size, text will continue getting smaller.
          fontSize: `${0.002 * imgSize.x}rem`,
          textShadow: '1px 1px 0.2em black',
        }}
      >
        {tag.name || 'New Tag'}
      </span>
    </Overlay>
  );
}
