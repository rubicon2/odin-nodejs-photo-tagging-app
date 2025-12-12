import Overlay from './Overlay';
import { useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const Tag = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TagBorder = styled.div`
  border: 2px solid white;
  border-radius: 5px;

  cursor: pointer;
  user-select: none;
`;

const TagText = styled.div`
  user-select: none;
  color: white;
  text-shadow:
    1px 1px orange,
    2px 2px red,
    3px 3px 3px black;
`;

interface Props {
  tag: Tag;
  imgSize: Pos;
  onDrag?: (pos: Pos) => any;
}

export default function PhotoTagOverlay({
  tag,
  imgSize,
  onDrag = () => {},
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [tagSize, setTagSize] = useState<Pos>({ x: 0, y: 0 });
  const startDragPosRef = useRef<Pos>({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    setTagSize({
      x: bounds.width,
      y: bounds.height,
    });
    // Since font scales with imgSize, re-run this calculation when imgSize changes.
  }, [tag, imgSize]);

  function startDrag(event: React.MouseEvent<HTMLElement>) {
    startDragPosRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    if (!ref.current) return;
    const initialZ = ref.current.style.zIndex;

    function removeMouseListeners() {
      if (!ref.current) return;
      ref.current.style.zIndex = initialZ;
      ref.current.removeEventListener('mousemove', updateTagPos);
      // Only occurs if the mouse button is released while pointer is within the element.
      ref.current.removeEventListener('mouseup', updateTagPos);
      // In case pointer leaves element without mouseup occurring.
      ref.current.removeEventListener('mouseleave', removeMouseListeners);
    }

    // Ensure this is 'above' all the other tags so dragging can't be interrupted.
    ref.current.style.zIndex = `${initialZ + 1}`;
    ref.current.addEventListener('mousemove', updateTagPos);
    ref.current.addEventListener('mouseup', removeMouseListeners);
    ref.current.addEventListener('mouseleave', removeMouseListeners);
  }

  function updateTagPos(this: HTMLElement, event: MouseEvent) {
    // MouseEvents only seem to give click and mouse positions in browser terms,
    // so there is no simple way to get the position relative to the image, or relative
    // to the tag's original position, or drag distance, or anything like that.
    // So this function will work out the difference between the original click position
    // and the current mouse position, and add that onto the tag's original position
    // to move it the correct amount. Then work out as a percentage of the image size,
    // since the posX and posY on tags are a percentage of img dimensions so they will
    // be uniform on all screen sizes/zoom levels.

    // Need to update onDragEnd with the posX/Y as a percentage of the width/height, remember!
    const startPosPx = startDragPosRef.current;

    const dragDiffPx: Pos = {
      x: event.clientX - startPosPx.x,
      y: event.clientY - startPosPx.y,
    };

    const originalTagPosPx: Pos = {
      x: imgSize.x * tag.posX,
      y: imgSize.y * tag.posY,
    };

    const newPosPx: Pos = {
      x: originalTagPosPx.x + dragDiffPx.x,
      y: originalTagPosPx.y + dragDiffPx.y,
    };

    const newPos: Pos = {
      x: newPosPx.x / imgSize.x,
      y: newPosPx.y / imgSize.y,
    };

    // Update source data which will update tag data and trigger a re-render of this component.
    onDrag(newPos);
  }

  return (
    <Overlay
      xPos={`${tag.posX * imgSize.x - tagSize.x / 2}px`}
      yPos={`${tag.posY * imgSize.y - tagSize.y / 2}px`}
    >
      <Tag>
        <TagBorder
          ref={ref}
          onMouseDown={startDrag}
          style={{
            width: `${imgSize.x / 10}px`,
            height: `${imgSize.x / 10}px`,
          }}
        />
        {/* // Scale text with image - don't use vw since once image
        // reaches min size, text will continue getting smaller. */}
        <TagText style={{ fontSize: `${0.002 * imgSize.x}rem` }}>
          {tag.name || 'New Tag'}
        </TagText>
      </Tag>
    </Overlay>
  );
}
