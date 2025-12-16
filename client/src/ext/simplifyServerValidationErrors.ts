interface SimpleValidationErrors {
  [key: string]: Array<string>;
}

export default function simplifyServerValidationErrors(
  validationErrors: Array<ServerValidationError> = [],
): any {
  const output: SimpleValidationErrors = { array: [] };
  for (const error of validationErrors) {
    if (!output[error.path]) {
      const pathArray: Array<string> = [];
      output[error.path] = pathArray;
    }
    output[error.path].push(error.msg);
    output.array.push(`${error.path} ${error.type} error: ${error.msg}`);
  }
  return output;
}
