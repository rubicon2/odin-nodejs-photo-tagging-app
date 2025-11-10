import Overlay from './Overlay';

interface Props {
  tag: EditableTag;
  imgSize: Pos;
}

export default function EditModePhotoTagOverlay({ tag, imgSize }: Props) {
  return (
    <Overlay
      xPos={`${tag.posX * imgSize.x}px`}
      yPos={`${tag.posY * imgSize.y}px`}
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
