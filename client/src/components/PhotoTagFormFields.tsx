interface Props {
  tag: Tag;
  tagIndex: Number;
  onChange?: Function;
  onDelete?: Function;
}

export default function PhotoTagFormFields({
  tag,
  tagIndex,
  onChange = () => {},
  onDelete = () => {},
}: Props) {
  return (
    <div>
      <label>
        Name:
        <input
          type="text"
          required
          name={`tags[${tagIndex}][name]`}
          value={tag.name}
          onChange={(e) => onChange({ ...tag, name: e.target.value })}
        />
      </label>
      <label>
        Pos X:
        <input
          type="number"
          step="0.0001"
          required
          name={`tags[${tagIndex}][posX]`}
          value={tag.posX.toString()}
          onChange={(e) => onChange({ ...tag, posX: e.target.value })}
        />
      </label>
      <label>
        Pos Y:
        <input
          type="number"
          step="0.0001"
          required
          name={`tags[${tagIndex}][posY]`}
          value={tag.posY.toString()}
          onChange={(e) => onChange({ ...tag, posY: e.target.value })}
        />
      </label>
      <button type="button" onClick={() => onDelete(tag)}>
        Delete
      </button>
    </div>
  );
}
