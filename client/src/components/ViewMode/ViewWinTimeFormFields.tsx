import ValidatedInput from '../ValidatedInput';

interface Props {
  name: string;
  onChange?: React.FormEventHandler<HTMLInputElement>;
}

export default function ViewWinTimeFormFields({
  name,
  onChange = () => {},
}: Props) {
  return (
    <label htmlFor="name">
      Name:
      <ValidatedInput
        type="text"
        name="name"
        id="name"
        required
        minLength={3}
        maxLength={3}
        pattern="[a-zA-Z]*"
        placeholder="aaa"
        value={name}
        onChange={onChange}
        validationMsgFn={(validity: ValidityState) => {
          if (validity.valueMissing) {
            return 'Name is a required field';
          } else if (validity.tooShort || validity.tooLong) {
            return 'Name should be 3 characters';
          } else if (validity.patternMismatch) {
            return 'Name should consist of alphabetical characters only';
          } else {
            return null;
          }
        }}
      />
    </label>
  );
}
