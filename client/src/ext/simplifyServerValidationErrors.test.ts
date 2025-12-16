import simplifyServerValidationErrors from './simplifyServerValidationErrors';
import { describe, it, expect } from 'vitest';

describe('validationToMsg', () => {
  it.each([
    {
      testType: 'empty validation errors array',
      validationErrors: [],
      expectedOutput: { array: [] },
    },
    {
      testType: 'undefined validation errors array',
      validationErrors: undefined,
      expectedOutput: { array: [] },
    },
    {
      testType:
        'a properly formatted validation errors array with a single error',
      validationErrors: [
        {
          location: 'body',
          path: 'name',
          type: 'field',
          value: 'joanna',
          msg: `Those kinds of characters are not permitted`,
        },
      ],
      expectedOutput: {
        name: ['Those kinds of characters are not permitted'],
        array: [
          'name field error: Those kinds of characters are not permitted',
        ],
      },
    },
    {
      testType:
        'a properly formatted validation errors array with multiple errors with different paths',
      validationErrors: [
        {
          location: 'body',
          path: 'name',
          type: 'field',
          value: 'joanna',
          msg: `Those kinds of characters are not permitted`,
        },
        {
          location: 'body',
          path: 'age',
          type: 'field',
          value: '290',
          msg: `Out of a reasonable range, get real`,
        },
      ],
      expectedOutput: {
        name: ['Those kinds of characters are not permitted'],
        age: ['Out of a reasonable range, get real'],
        array: [
          'name field error: Those kinds of characters are not permitted',
          'age field error: Out of a reasonable range, get real',
        ],
      },
    },
    {
      testType:
        'a properly formatted validation errors array with multiple errors with the same path',
      validationErrors: [
        {
          location: 'body',
          path: 'name',
          type: 'field',
          value: 'joanna',
          msg: `Those kinds of characters are not permitted`,
        },
        {
          location: 'body',
          path: 'name',
          type: 'field',
          value: 'aaaaaaaaaaaaaaaaaaaaaaaaaaa',
          msg: `Exceeds the maximum length`,
        },
      ],
      expectedOutput: {
        name: [
          'Those kinds of characters are not permitted',
          'Exceeds the maximum length',
        ],
        array: [
          'name field error: Those kinds of characters are not permitted',
          'name field error: Exceeds the maximum length',
        ],
      },
    },
  ])(
    'given $testType, simplifies server validation errors into a format suitable for updating form error elements',
    ({ validationErrors, expectedOutput }) => {
      expect(simplifyServerValidationErrors(validationErrors)).toStrictEqual(
        expectedOutput,
      );
    },
  );
});
