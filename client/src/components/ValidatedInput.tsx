import FormError from '../styled/FormError';
import { useRef, useState, useEffect } from 'react';

interface Props {
  validationMsgFn?: (validity: ValidityState) => string | null;
}

export default function ValidatedInput({
  validationMsgFn = () => null,
  ...props
}: Props & React.HTMLProps<HTMLInputElement>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  function displayError(element: HTMLInputElement, msg: string | null) {
    setValidationMsg(msg);
    if (msg) {
      element.classList.add('invalid');
    } else {
      element.classList.remove('invalid');
    }
  }

  function checkValidity(element: HTMLInputElement): boolean {
    const validity = element.validity;
    displayError(element, validationMsgFn(validity));
    return validity.valid;
  }

  function checkUntilValid(event: Event) {
    const target = event.target;
    if (target) {
      const valid = checkValidity(target as HTMLInputElement);
      if (valid) target.removeEventListener('input', checkUntilValid);
    }
  }

  useEffect(() => {
    function handleBlur(event: FocusEvent) {
      const target = event.target;
      if (target && !checkValidity(target as HTMLInputElement)) {
        // In case it is already added, remove first (there is no way of simply checking first).
        target.removeEventListener('input', checkUntilValid);
        target.addEventListener('input', checkUntilValid);
      }
    }

    inputRef.current?.addEventListener('blur', handleBlur);
    return () => inputRef.current?.removeEventListener('blur', handleBlur);
  }, []);

  return (
    <>
      <input {...props} ref={inputRef} />
      <FormError aria-live="polite">{validationMsg}</FormError>
    </>
  );
}
