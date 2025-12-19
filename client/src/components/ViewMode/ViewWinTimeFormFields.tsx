import FormError from '../../styled/FormError';
import { useState } from 'react';

interface Props {
  name: string;
  onChange?: React.FormEventHandler<HTMLInputElement>;
}

export default function ViewWinTimeFormFields({
  name,
  onChange = () => {},
}: Props) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function setError(element: HTMLInputElement, msg: string): void {
    setErrorMsg(msg);
    element.classList.add('invalid');
  }

  function clearError(element: HTMLInputElement): void {
    setErrorMsg(null);
    element.classList.remove('invalid');
  }

  function checkValidity(element: HTMLInputElement): boolean {
    const validity = element.validity;
    if (validity.valueMissing) {
      setError(element, 'Name is a required field');
    } else if (validity.tooShort || validity.tooLong) {
      setError(element, 'Name should be 3 characters');
    } else if (validity.patternMismatch) {
      setError(element, 'Name should consist of alphabetical characters only');
    } else {
      clearError(element);
    }
    return validity.valid;
  }

  function checkUntilValid(event: any) {
    const valid = checkValidity(event.currentTarget);
    if (valid)
      event.currentTarget.removeEventListener('input', checkUntilValid);
  }

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
        placeholder="aaa"
        value={name}
        onChange={onChange}
        onBlur={({ currentTarget }) => {
          if (!checkValidity(currentTarget)) {
            currentTarget.addEventListener('input', checkUntilValid);
          }
        }}
      />
      {errorMsg && <FormError>{errorMsg}</FormError>}
    </label>
  );
}
