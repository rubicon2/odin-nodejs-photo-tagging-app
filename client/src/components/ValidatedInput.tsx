import FormError from '../styled/FormError';
import { useRef, useState, useEffect } from 'react';

interface Props {
  validationMsgFn?: (validity: ValidityState) => string | null;
  value?: any;
}

export default function ValidatedInput({
  validationMsgFn = () => null,
  value,
  ...props
}: Props & React.HTMLProps<HTMLInputElement>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const isControlledInput = value !== undefined;

  function displayError(msg: string | null) {
    setValidationMsg(msg);
    if (inputRef.current) {
      if (msg) {
        inputRef.current.classList.add('invalid');
      } else {
        inputRef.current.classList.remove('invalid');
      }
    }
  }

  function checkValidity(): boolean {
    if (inputRef.current) {
      const validity = inputRef.current?.validity;
      displayError(validationMsgFn(validity));
      return validity.valid;
    } else return true;
  }

  function checkUntilValid() {
    if (inputRef.current) {
      const valid = checkValidity();
      if (valid) inputRef.current.removeEventListener('input', checkUntilValid);
    }
  }

  useEffect(() => {
    function handleBlur() {
      if (inputRef.current && !checkValidity()) {
        // In case it is already added, remove first (there is no way of simply checking first).
        inputRef.current.removeEventListener('input', checkUntilValid);
        inputRef.current.addEventListener('input', checkUntilValid);
      }
    }

    inputRef.current?.addEventListener('blur', handleBlur);
    return () => inputRef.current?.removeEventListener('blur', handleBlur);
  }, []);

  // So that if value changes without user input (e.g. if a
  // controlled input), the validity error will still be updated.
  // Doesn't work exactly like uncontrolled input though.
  // Well... xPos does, but name doesn't?
  useEffect(() => {
    if (isControlledInput && value !== '') checkValidity();
  }, [value]);

  return (
    <>
      <input {...props} ref={inputRef} value={value} />
      <FormError aria-live="polite">{validationMsg}</FormError>
    </>
  );
}
