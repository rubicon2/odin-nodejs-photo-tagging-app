import PhotoWithTagOverlays from '../PhotoWithTagOverlays.js';
import PhotoTagsForm from './PhotoTagsForm.js';
import DangerButton from '../../styled/DangerButton.js';
import * as api from '../../ext/api.admin.js';
import React, { useEffect, useState } from 'react';

interface Props {
  photo: AdminPhoto;
  onSave?: Function;
  onDelete?: Function;
}

// Be able to edit tags and altText, and delete.
export default function PhotoDetails({
  photo,
  onSave = () => {},
  onDelete = () => {},
}: Props) {
  const [msg, setMsg] = useState(null);
  // We need to have tags set in state so that changes can be
  // stored, and then sent to the server if the user chooses to save them.
  const [tags, setTags] = useState<Array<EditableTag>>(photo.tags);
  const [tagsToDelete, setTagsToDelete] = useState<Array<Tag>>([]);

  // Since tags are state, without this they would persist even if the photo changes.
  useEffect(() => {
    setTags(photo.tags);
  }, [photo]);

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
      ) as Array<Tag>;

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

  function updateTag(index: number, updatedTag: EditableTag) {
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
        <div>
          <h3>Photo Details Panel - {photo.id}</h3>
          <PhotoWithTagOverlays
            photo={photo}
            tags={tags}
            onClick={createNewTag}
            onTagDrag={updateTag}
          />
          <PhotoTagsForm
            tags={tags}
            onUpdate={updateTag}
            onDelete={deleteTag}
            onSave={saveTagChangesToServer}
          />
          <DangerButton type="button" onClick={deletePhoto}>
            Delete
          </DangerButton>
        </div>
      ) : (
        <div>
          <p>No photo selected.</p>
        </div>
      )}
      {msg && <p>{msg}</p>}
    </>
  );
}
