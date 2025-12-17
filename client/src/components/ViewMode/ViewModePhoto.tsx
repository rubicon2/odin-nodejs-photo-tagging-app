import Container from '../../styled/Container';
import ViewTagListModal from './ViewTagListModal';
import PhotoWithTagOverlays from '../PhotoWithTagOverlays';
import Overlay from '../Overlay';
import * as api from '../../ext/api';

import { useState, useLayoutEffect } from 'react';
import styled from 'styled-components';

const PhotoContainer = styled(Container)`
  // So overlay is positioned relative to image, not whole page.
  position: relative;
`;

interface Props {
  photo: Photo;
  onTagFound?: (tag: Tag) => any;
  onAllTagsFound?: (msToFinish: number) => any;
  onMessage?: (msg: string) => any;
}

export default function ViewModePhoto({
  photo,
  onTagFound = () => {},
  onAllTagsFound = () => {},
  onMessage = () => {},
}: Readonly<Props>) {
  const [foundTags, setFoundTags] = useState<Array<Tag>>([]);
  const [isTagListActive, setIsTagListActive] = useState<boolean>(false);
  const [clickPos, setClickPos] = useState<Pos | null>(null);

  async function checkTag(tagId: string) {
    try {
      if (!photo || !clickPos) return;
      const response = await api.postTagCheck(
        photo.id as string,
        tagId,
        clickPos.x,
        clickPos.y,
      );
      const json = await response?.json();
      if (response.ok) {
        // Update with latest found tag list.
        const updatedFoundTags: Array<Tag> = json.data?.foundTags;
        // Only set state if the list length is different to prevent redundant rerenders.
        if (updatedFoundTags.length > foundTags.length) {
          setFoundTags(updatedFoundTags);
          const newTag: Tag | undefined = updatedFoundTags.find(
            ({ id }) => !foundTags.map((t) => t.id).includes(id),
          );
          if (newTag) onTagFound(newTag);
        }

        // Deal with all tags found.
        const foundAllTags: boolean = json.data?.foundAllTags;
        const msToFinish: number = json.data?.msToFinish;
        if (foundAllTags) onAllTagsFound(msToFinish);
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

  // With regular effect, could see old tags on new
  // photo for a moment before they were cleared.
  useLayoutEffect(() => {
    setFoundTags([]);
  }, [photo]);

  return (
    <PhotoContainer>
      <ViewTagListModal
        isActive={isTagListActive}
        tags={photo.tags}
        onTagClick={async (id: React.Key) => {
          await checkTag(id as string);
          setIsTagListActive(false);
        }}
        onClose={() => {
          setClickPos(null);
          setIsTagListActive(false);
        }}
      />
      <PhotoWithTagOverlays
        photo={photo}
        tags={foundTags}
        clickPos={clickPos}
        onClick={(pos: Pos) => {
          // Save pos for fetch request later.
          setClickPos(pos);
          // Open menu for selecting who the tag is of.
          setIsTagListActive(true);
        }}
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
