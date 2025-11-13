import PhotoWithTagOverlays from '../PhotoWithTagOverlays';
import Overlay from '../Overlay';
import * as api from '../../ext/api';

interface Props {
  photo: UserPhoto;
  foundTags?: Array<Tag>;
  onTagsFound?: (tags: Array<Tag>) => any;
  onMessage?: (msg: string) => any;
}

export default function ViewModePhoto({
  photo,
  foundTags = [],
  onTagsFound = () => {},
  onMessage = () => {},
}: Props) {
  async function checkClickPos(pos: Pos) {
    try {
      if (!photo) return;
      const response = await api.postTagCheck(photo.id as string, pos.x, pos.y);
      const json = await response?.json();
      if (response.ok) {
        let tags: Array<Tag> = json.data?.tags;
        // Filter out any tags that have already been found.
        // tags = tags.filter((tag) => )
        // If there are any tags left, these are newly found.
        if (tags.length > 0) onTagsFound(tags);
      } else {
        if (json.data?.message) {
          onMessage(json.data.message);
        }
      }
    } catch (error: any) {
      console.error(error.message);
      onMessage(error.message);
    }
  }

  return (
    // So overlay is positioned relative to image, not whole page.
    <div style={{ position: 'relative' }}>
      <PhotoWithTagOverlays
        photo={photo}
        tags={foundTags}
        onClick={checkClickPos}
      />
      <Overlay>
        <span
          style={{
            color: 'white',
            fontSize: '2rem',
            textShadow: '2px 2px 2px orange',
          }}
        >
          {foundTags.length}/{photo.tagCount} found
        </span>
      </Overlay>
    </div>
  );
}
