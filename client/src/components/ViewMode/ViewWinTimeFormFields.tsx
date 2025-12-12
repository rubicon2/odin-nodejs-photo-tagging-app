interface Props {
  name: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export default function ViewWinTimeFormFields({
  name,
  onChange = () => {},
}: Props) {
  return (
    <label htmlFor="name">
      Name:
      <input
        type="text"
        name="name"
        id="name"
        required
        minLength={3}
        maxLength={3}
        value={name}
        onChange={onChange}
      />
    </label>
  );
}
