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

  function checkUntilValid(event: any) {
    const valid = checkValidity(event.currentTarget);
    if (valid)
      event.currentTarget.removeEventListener('input', checkUntilValid);
  }

  useEffect(() => {
    function blurHandler({ currentTarget }: any) {
      if (!checkValidity(currentTarget)) {
        // In case it is already added, remove first (there is no way of simply checking first).
        currentTarget.removeEventListener('input', checkUntilValid);
        currentTarget.addEventListener('input', checkUntilValid);
      }
    }

    inputRef.current?.addEventListener('blur', blurHandler);
    return () => inputRef.current?.removeEventListener('blur', blurHandler);
  }, []);

  return (
    <>
      <input {...props} ref={inputRef} />
      <FormError aria-live="polite">{validationMsg}</FormError>
    </>
  );
}
