import ImportantButton from '../../styled/ImportantButton';
import DangerButton from '../../styled/DangerButton';

interface Props {
  tags: Array<EditableTag>;
  onUpdate?: Function;
  onDelete?: Function;
  onSave?: React.FormEventHandler;
}

export default function EditPhotoTags({
  tags,
  onUpdate = () => {},
  onDelete = () => {},
  onSave = () => {},
}: Props) {
  return (
    <div>
      <h4>Edit Tags Panel</h4>
      <form onSubmit={onSave}>
        {tags.map((tag, index) => (
          <fieldset key={index}>
            <legend>{tag.id || 'New Tag'}</legend>
            {/* Include id in form data. */}
            <label style={{ display: 'none' }}>
              Id:
              <input
                type="text"
                name={`tags[${index}][id]`}
                readOnly
                value={tag.id as string}
              />
            </label>
            <label>
              Name:
              <input
                type="text"
                name={`tags[${index}][name]`}
                required
                value={tag.name}
                placeholder="Tag Name"
                onChange={(e) =>
                  onUpdate(index, { ...tag, name: e.target.value })
                }
              />
            </label>
            <label>
              X Position:
              <input
                type="number"
                step="0.001"
                name={`tags[${index}][posX]`}
                required
                value={tag.posX.toString()}
                onChange={(e) =>
                  onUpdate(index, { ...tag, posX: e.target.value })
                }
              />
            </label>
            <label>
              Y Position:
              <input
                type="number"
                step="0.001"
                name={`tags[${index}][posY]`}
                required
                value={tag.posY.toString()}
                onChange={(e) =>
                  onUpdate(index, { ...tag, posY: e.target.value })
                }
              />
            </label>
            <DangerButton type="button" onClick={() => onDelete(index)}>
              Delete
            </DangerButton>
          </fieldset>
        ))}
        <ImportantButton type="submit">Save Tags</ImportantButton>
      </form>
    </div>
  );
}
