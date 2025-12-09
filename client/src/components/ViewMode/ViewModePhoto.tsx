import PhotoWithTagOverlays from '../PhotoWithTagOverlays';
import Overlay from '../Overlay';
import Container from '../../styled/Container';
import Modal from '../Modal';
import UnstyledList from '../../styled/UnstyledList';
import * as api from '../../ext/api';
import { useState, useRef, useLayoutEffect } from 'react';
import styled from 'styled-components';

const PhotoContainer = styled(Container)`
  // So overlay is positioned relative to image, not whole page.
  position: relative;
`;

interface Props {
  photo: UserPhoto;
  onTagFound?: (tag: Tag) => any;
  onAllTagsFound?: (msToFinish: number) => any;
  onMessage?: (msg: string) => any;
}

export default function ViewModePhoto({
  photo,
  onTagFound = () => {},
  onAllTagsFound = () => {},
  onMessage = () => {},
}: Props) {
  const [foundTags, setFoundTags] = useState<Array<Tag>>([]);
  const [isTagListActive, setIsTagListActive] = useState<boolean>(false);
  // Click pos can be kept in ref, since not used for rendering.
  const clickPosRef = useRef<Pos | null>(null);

  async function checkTag(tagId: string) {
    try {
      if (!photo || !clickPosRef.current) return;
      const clickPos = clickPosRef.current;
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
      <Modal
        isActive={isTagListActive}
        onClose={() => {
          clickPosRef.current = null;
          setIsTagListActive(false);
        }}
      >
        Who is it?
        <UnstyledList>
          {photo.tags.map((tag: Tag) => {
            return (
              <li
                key={tag.id}
                onClick={async () => {
                  await checkTag(tag.id as string);
                  setIsTagListActive(false);
                }}
              >
                {tag.name}
              </li>
            );
          })}
        </UnstyledList>
      </Modal>
      <PhotoWithTagOverlays
        photo={photo}
        tags={foundTags}
        onClick={(pos: Pos) => {
          // Save pos for fetch request later.
          clickPosRef.current = pos;
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
