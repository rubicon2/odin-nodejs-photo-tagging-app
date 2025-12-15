export default function simplifyServerValidationErrors(
  validationErrors: Array<ServerValidationError> = [],
): any {
  const msgArray = [];
  for (const error of validationErrors) {
    msgArray.push(`${error.path} ${error.type} error: ${error.msg}`);
  }
  return msgArray;
}
