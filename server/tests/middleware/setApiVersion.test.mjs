import setApiVersion from '../../src/middleware/setApiVersion.mjs';
import { beforeEach, vi, describe, it, expect } from 'vitest';
import httpMocks from 'node-mocks-http';

let req;
let res;
let next;

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = vi.fn();
});

describe('setApiVersion', () => {
  it.each([
    {
      parameter: 1,
      expected: 1,
    },
    {
      parameter: 2,
      expected: 2,
    },
    {
      parameter: 3.14,
      expected: 3.14,
    },
    {
      parameter: '2.1.0',
      expected: '2.1.0',
    },
    {
      parameter: () => 2 * 16,
      expected: 32,
    },
  ])(
    "should take a parameter of type string, number or function and set req.apiVersion to that value, or function's result",
    ({ parameter, expected }) => {
      const middleware = setApiVersion(parameter);
      middleware(req, res, next);
      expect(req.apiVersion).toBe(expected);
    },
  );

  it.each([
    {
      parameter: [1, 2, 3],
    },
    {
      parameter: { a: 1, b: 2, c: 3 },
    },
  ])(
    'should not crash if given a parameter of type object (i.e. object or array)',
    ({ parameter }) => {
      const middleware = setApiVersion(parameter);
      middleware(req, res, next);
      expect(req.apiVersion).toBeUndefined();
    },
  );

  it('should call next once finished', () => {
    const middleware = setApiVersion(3);
    middleware(req, res, next);
    expect(next.mock.calls).toHaveLength(1);
    middleware(req, res, next);
    expect(next.mock.calls).toHaveLength(2);
  });
});
