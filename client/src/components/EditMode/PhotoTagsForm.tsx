import ImportantButton from '../../styled/ImportantButton';
import DangerButton from '../../styled/DangerButton';
import Form from '../../styled/Form';
import ValidatedInput from '../ValidatedInput';

interface Props {
  tags: Array<Tag>;
  onUpdate?: Function;
  onDelete?: Function;
  onSave?: React.FormEventHandler;
}

export default function PhotoTagsForm({
  tags,
  onUpdate = () => {},
  onDelete = () => {},
  onSave = () => {},
}: Props) {
  function createPosValidationMsgFn(fieldName: string) {
    return (v: ValidityState) => {
      if (v.valueMissing) return `${fieldName} is a required field`;
      else if (v.rangeUnderflow || v.rangeOverflow)
        return `${fieldName} should be between 0 and 1`;
      else if (v.typeMismatch)
        return `${fieldName} should be a number between 0 and 1`;
      else if (v.badInput)
        return `${fieldName} should be a number between 0 and 1`;
      else return null;
    };
  }

  return (
    <Form onSubmit={onSave}>
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
            <ValidatedInput
              type="text"
              name={`tags[${index}][name]`}
              required
              pattern="[a-zA-Z]*"
              value={tag.name}
              placeholder="Tag Name"
              onChange={(e) =>
                onUpdate(index, { ...tag, name: e.currentTarget.value })
              }
              validationMsgFn={(v) => {
                if (v.valueMissing) return 'Name is a required field';
                else if (v.patternMismatch)
                  return 'Name should be alphabetical characters only';
                else return null;
              }}
            />
          </label>
          <label>
            X Position:
            <ValidatedInput
              type="number"
              step="0.0001"
              name={`tags[${index}][posX]`}
              required
              min={0}
              max={1}
              value={parseFloat(tag.posX.toFixed(4))}
              onChange={(e) =>
                onUpdate(index, {
                  ...tag,
                  posX: parseFloat(e.currentTarget.value),
                })
              }
              validationMsgFn={createPosValidationMsgFn('PosX')}
            />
          </label>
          <label>
            Y Position:
            <ValidatedInput
              type="number"
              step="0.0001"
              name={`tags[${index}][posY]`}
              required
              min={0}
              max={1}
              value={parseFloat(tag.posY.toFixed(4))}
              onChange={(e) =>
                onUpdate(index, {
                  ...tag,
                  posY: parseFloat(e.currentTarget.value),
                })
              }
              validationMsgFn={createPosValidationMsgFn('PosY')}
            />
          </label>
          <DangerButton type="button" onClick={() => onDelete(index)}>
            Delete
          </DangerButton>
        </fieldset>
      ))}
      <ImportantButton type="submit">Save Tags</ImportantButton>
    </Form>
  );
}
