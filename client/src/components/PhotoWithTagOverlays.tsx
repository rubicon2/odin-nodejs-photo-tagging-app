import PhotoTagOverlay from './PhotoTagOverlay';
import useElementSize from '../hooks/useElementSize';
import getElementClickPos from '../ext/getElementClickPos';

import { useRef } from 'react';
import styled from 'styled-components';

const Photo = styled.img`
  width: 100%;
`;

interface Props {
  photo: Photo;
  tags: Array<Tag>;
  currentTag?: Tag;
  onClick?: (pos: Pos) => any;
  onTagDrag?: (index: number, updatedTag: Tag) => any;
}

export default function PhotoWithTagOverlays({
  photo,
  tags,
  currentTag,
  onClick = () => {},
  onTagDrag = () => {},
}: Readonly<Props>) {
  // Once image is rendered, we can get the width and height off it to render the overlaid tags.
  const img = useRef<HTMLImageElement>(null);
  const imgSize = useElementSize(img);

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    const newClickPos = getElementClickPos(event);
    onClick(newClickPos);
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <Photo
        ref={img}
        src={photo.url}
        alt={photo.altText}
        onClick={handleClick}
        draggable={false}
      />
      {tags.map((tag: Tag, index) => (
        <PhotoTagOverlay
          key={index}
          tag={tag}
          imgSize={imgSize}
          onDrag={({ x, y }) => onTagDrag(index, { ...tag, posX: x, posY: y })}
        />
      ))}
      {currentTag && <PhotoTagOverlay tag={currentTag} imgSize={imgSize} />}
    </div>
  );
}
