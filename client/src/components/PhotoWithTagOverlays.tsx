import PhotoTagOverlay from './PhotoTagOverlay';
import getElementClickPos from '../ext/getElementClickPos';
import { useRef, useState, useLayoutEffect } from 'react';
import styled from 'styled-components';

const Photo = styled.img`
  width: 100%;
`;

interface Props {
  photo: Photo;
  tags: Array<EditableTag>;
  onClick?: (pos: Pos) => any;
  onTagDrag?: (index: number, updatedTag: EditableTag) => any;
}

export default function PhotoWithTagOverlays({
  photo,
  tags,
  onClick = () => {},
  onTagDrag = () => {},
}: Readonly<Props>) {
  // Once image is rendered, we can get the width and height off it to render the overlaid tags.
  const img = useRef<HTMLImageElement>(null);
  // Store the imgSize and when this is set, re-render will occur.
  const [imgSize, setImgSize] = useState<Pos>({ x: 0, y: 0 });

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    const clickPos = getElementClickPos(event);
    onClick(clickPos);
  }

  function handleImgChange(currentTarget: HTMLImageElement) {
    const imgSize = currentTarget.getBoundingClientRect();
    setImgSize({ x: imgSize.width, y: imgSize.height });
  }

  useLayoutEffect(() => {
    // Don't bother handling the initial img dimensions in a layout effect.
    // Images from server may not have loaded yet and size will be zero.
    // Handle in onLoad handler instead.
    function refreshImgSize() {
      if (!img.current) return;
      handleImgChange(img.current);
    }

    window.addEventListener('resize', refreshImgSize);
    return () => window.removeEventListener('resize', refreshImgSize);
  }, []);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <Photo
        ref={img}
        onLoad={(e) => handleImgChange(e.currentTarget)}
        src={photo.url}
        alt={photo.altText}
        onClick={handleClick}
        draggable={false}
      />
      {tags.map((tag: EditableTag, index) => (
        <PhotoTagOverlay
          key={index}
          tag={tag}
          imgSize={imgSize}
          onDrag={({ x, y }) => onTagDrag(index, { ...tag, posX: x, posY: y })}
        />
      ))}
    </div>
  );
}
