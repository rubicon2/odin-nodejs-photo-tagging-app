import FormError from '../styled/FormError';
import { useState } from 'react';

interface Props {
  validationMsgFn?: (validity: ValidityState) => string | null;
}

export default function ValidatedInput({
  validationMsgFn = () => null,
  ...props
}: Props & React.HTMLProps<HTMLInputElement>) {
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

  return (
    <>
      <input
        {...props}
        onBlur={({ currentTarget }) => {
          if (!checkValidity(currentTarget)) {
            currentTarget.addEventListener('input', checkUntilValid);
          }
        }}
      />
      <FormError>{validationMsg}</FormError>
    </>
  );
}
