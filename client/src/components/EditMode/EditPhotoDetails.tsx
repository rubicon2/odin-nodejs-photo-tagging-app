import PhotoWithTagOverlays from '../PhotoWithTagOverlays.js';
import PhotoTagsForm from './PhotoTagsForm.js';
import Form from '../../styled/Form.js';
import DangerButton from '../../styled/DangerButton.js';
import PaddedContainer from '../../styled/PaddedContainer.js';
import * as api from '../../ext/api.admin.js';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const PhotoContainer = styled(PaddedContainer)`
  // This is a bit ridiculous, but if we zero the padding like this
  // instead of adding padding to regular Container everywhere,
  // we can change the padding of all derived containers just by
  // changing the PaddedContainer styled component.
  // So if we later decided we wanted more padding as standard, we
  // could just change it in one place on PaddedContainer.
  max-width: auto;
  margin: 0;
  padding-top: 0;
  padding-left: 0;
  padding-right: 0;
`;

const InfoContainer = styled(PaddedContainer)`
  display: grid;
  grid-auto-rows: min-content;
  gap: 1rem;
  text-align: center;

  @media (min-width: 500px) {
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr;
    padding-left: 0;
    padding-right: 0;
    text-align: left;
  }
`;

const NoTopPaddedContainer = styled(PaddedContainer)`
  padding-top: 0;
`;

interface Props {
  photo: Photo;
  onSave?: Function;
  onDelete?: Function;
}

// Be able to edit tags and altText, and delete.
export default function PhotoDetails({
  photo,
  onSave = () => {},
  onDelete = () => {},
}: Readonly<Props>) {
  const [msg, setMsg] = useState<string | null>(null);
  // We need to have tags set in state so that changes can be
  // stored, and then sent to the server if the user chooses to save them.
  const [tags, setTags] = useState<Array<Tag>>(photo.tags);
  const [tagsToDelete, setTagsToDelete] = useState<Array<Tag>>([]);

  // Since tags are state, without this they would persist even if the photo changes.
  useEffect(() => {
    setTags(photo.tags);
    setTagsToDelete([]);
    setMsg(null);
  }, [JSON.stringify(photo)]);

  async function deletePhoto(event: React.MouseEvent) {
    try {
      if (!photo) return;
      event.preventDefault();
      const response = await api.deletePhoto(photo.id as string);
      if (response.ok) {
        const json = await response?.json();
        if (json.data?.message) {
          setMsg(json.data.message);
        }
        onDelete();
      }
    } catch (error: any) {
      setMsg(error.message);
    }
  }

  async function saveTagChangesToServer(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    try {
      if (!photo) return;
      event.preventDefault();

      const tagsToCreate = tags.filter((tag) => !tag.id);
      const tagsToUpdate = tags.filter(
        (tag) =>
          tag.id !== undefined &&
          // Filter out client tags that have not changed since being loaded from server.
          !Object.is(
            tag,
            photo.tags.find((t) => t.id === tag.id),
          ),
        // Use Required<Tag> since we know these will have ids, etc.
      ) as Array<Required<Tag>>;

      const response = await api.putPhotoTags(
        photo.id as string,
        tagsToCreate,
        tagsToUpdate,
        tagsToDelete.map((tag) => tag.id as string),
      );
      const json = await response?.json();
      const msg = json.data?.message;
      if (response.ok) {
        setMsg(msg);
        setTagsToDelete([]);
        onSave();
      } else {
        if (msg) throw new Error(msg);
      }
    } catch (error: any) {
      setMsg(error.message);
    }
  }

  function createNewTag(clickPos: Pos) {
    // Create new tag on client. Save to server later when an id will be created for it.
    setTags([
      ...tags,
      {
        posX: clickPos.x,
        posY: clickPos.y,
        name: '',
      },
    ]);
  }

  function updateTag(index: number, updatedTag: Tag) {
    // Have to use index for this since new tags won't have IDs yet.
    const updatedTags = tags.map((tag, i) => {
      if (index !== i) return tag;
      else return updatedTag;
    });
    setTags(updatedTags);
  }

  function deleteTag(index: number) {
    // Have to use index for this since new tags won't have IDs yet.
    // @ts-ignore - need index so have to include tag. Stop whining.
    const tagToDelete = tags.find((tag, i) => i === index);
    // Only try to delete tags with ids - those without have never been saved to server db.
    if (tagToDelete?.id) {
      setTagsToDelete([
        ...tagsToDelete,
        // Since we checked for an id, we know this is a tag from the server and not a new tag.
        tagToDelete as Tag,
      ]);
    }
    // Remove tag from tags array so it is not updated or created.
    // @ts-ignore - need index so have to include tag. Stop whining.
    setTags(tags.filter((tag, i) => i !== index));
  }

  return (
    <>
      {photo ? (
        <>
          <PhotoContainer>
            <PhotoWithTagOverlays
              photo={photo}
              tags={tags}
              onClick={createNewTag}
              onTagDrag={updateTag}
            />
            <InfoContainer>
              {<span>{msg}</span>}
              {/* Form does nothing, but provides nice auto formatting for diff screen sizes. */}
              <Form>
                <DangerButton type="button" onClick={deletePhoto}>
                  Delete Photo
                </DangerButton>
              </Form>
            </InfoContainer>
          </PhotoContainer>
          <NoTopPaddedContainer>
            <PhotoTagsForm
              tags={tags}
              onUpdate={updateTag}
              onDelete={deleteTag}
              onSave={saveTagChangesToServer}
            />
          </NoTopPaddedContainer>
        </>
      ) : (
        <div>
          <p>No photo selected.</p>
        </div>
      )}
    </>
  );
}
