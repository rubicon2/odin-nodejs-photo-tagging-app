import roundToDigits from './roundToDigits';
import { describe, it, expect } from 'vitest';

describe('roundToDigits', () => {
  it.each([
    {
      testType: 'round up to -1 dp (i.e. zero the tens)',
      value: 299,
      decimalDigits: -2,
      expectedResult: 300,
    },
    {
      testType: 'round down to -1 dp (i.e. zero the tens)',
      value: 211,
      decimalDigits: -2,
      expectedResult: 200,
    },
    {
      testType: 'round up to -1 dp (i.e. zero the ones)',
      value: 29,
      decimalDigits: -1,
      expectedResult: 30,
    },
    {
      testType: 'round down to -1 dp (i.e. zero the ones)',
      value: 21,
      decimalDigits: -1,
      expectedResult: 20,
    },
    {
      testType: 'round up to 0 dp',
      value: 2.8,
      decimalDigits: 0,
      expectedResult: 3,
    },
    {
      testType: 'round down to 0 dp',
      value: 2.4,
      decimalDigits: 0,
      expectedResult: 2,
    },
    {
      testType: 'round up to 1 dp',
      value: 2.89,
      decimalDigits: 1,
      expectedResult: 2.9,
    },
    {
      testType: 'round down to 1 dp',
      value: 2.14,
      decimalDigits: 1,
      expectedResult: 2.1,
    },
    {
      testType: 'round up to 2 dp',
      value: 2.889,
      decimalDigits: 2,
      expectedResult: 2.89,
    },
    {
      testType: 'round down to 2 dp',
      value: 2.141,
      decimalDigits: 2,
      expectedResult: 2.14,
    },
    {
      testType: 'round up to 3 dp',
      value: 2.4435,
      decimalDigits: 3,
      expectedResult: 2.444,
    },
    {
      testType: 'round down to 3 dp',
      value: 2.4434,
      decimalDigits: 3,
      expectedResult: 2.443,
    },
    {
      testType: 'works rounding up to negative values',
      value: -2.4439,
      decimalDigits: 3,
      expectedResult: -2.444,
    },
    {
      testType: 'works rounding down to negative values',
      value: -2.4434,
      decimalDigits: 3,
      expectedResult: -2.443,
    },
  ])(
    'rounds $value to $decimalDigits decimal place values',
    ({ value, decimalDigits, expectedResult }) => {
      const result = roundToDigits(value, decimalDigits);
      expect(result).toStrictEqual(expectedResult);
    },
  );
});
