import PhotoWithTagOverlays from '../PhotoWithTagOverlays';
import Overlay from '../Overlay';
import Container from '../../styled/Container';
import * as api from '../../ext/api';
import styled from 'styled-components';

const PhotoContainer = styled(Container)`
  // So overlay is positioned relative to image, not whole page.
  position: relative;
`;

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
        let tagsNearClickPos: Array<Tag> = json.data?.tags;
        // Filter out any tags that have already been found.
        tagsNearClickPos = tagsNearClickPos.filter(
          (tagNearClickPos) =>
            foundTags.find((tag) => tag.id === tagNearClickPos.id) ===
            undefined,
        );
        // If there are any tags left, these are tags that haven't been found yet.
        if (tagsNearClickPos.length > 0) onTagsFound(tagsNearClickPos);
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
    <PhotoContainer>
      <PhotoWithTagOverlays
        photo={photo}
        tags={foundTags}
        onClick={checkClickPos}
      />
      <Overlay>
        <div
          style={{
            padding: '1rem',
            color: 'white',
            fontSize: '2rem',
            // Standard line height from index.css is 1.5, but looks like extra padding here.
            lineHeight: '1',
            textShadow:
              // So it scales with fontSize, use em or ch.
              '0.05ch 0.05ch orange, 0.1ch 0.1ch red, 0.2ch 0.2ch 5px black',
          }}
        >
          {foundTags.length}/{photo.tagCount} found
        </div>
      </Overlay>
    </PhotoContainer>
  );
}
