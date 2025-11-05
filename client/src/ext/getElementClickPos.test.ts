import getElementClickPos from './getElementClickPos';
import { describe, it, expect } from 'vitest';

describe('getElementClickPos', () => {
  it.each([
    {
      testType: 'centre',
      clickPos: { x: 100, y: 100 },
      targetSize: { x: 200, y: 200 },
      expectedPos: { x: 0.5, y: 0.5 },
    },
    {
      testType: 'centre, larger size',
      clickPos: { x: 1000, y: 1000 },
      targetSize: { x: 2000, y: 2000 },
      expectedPos: { x: 0.5, y: 0.5 },
    },
    {
      testType: 'top left',
      clickPos: { x: 0, y: 0 },
      targetSize: { x: 200, y: 200 },
      expectedPos: { x: 0, y: 0 },
    },
    {
      testType: 'top left, larger size',
      clickPos: { x: 0, y: 0 },
      targetSize: { x: 2000, y: 20000 },
      expectedPos: { x: 0, y: 0 },
    },
    {
      testType: 'bottom left',
      clickPos: { x: 0, y: 200 },
      targetSize: { x: 200, y: 200 },
      expectedPos: { x: 0, y: 1 },
    },
    {
      testType: 'bottom left, larger size',
      clickPos: { x: 0, y: 2000 },
      targetSize: { x: 2000, y: 2000 },
      expectedPos: { x: 0, y: 1 },
    },
    {
      testType: 'top right',
      clickPos: { x: 200, y: 200 },
      targetSize: { x: 200, y: 200 },
      expectedPos: { x: 1, y: 1 },
    },
    {
      testType: 'top right, larger size',
      clickPos: { x: 2000, y: 2000 },
      targetSize: { x: 2000, y: 2000 },
      expectedPos: { x: 1, y: 1 },
    },
    {
      testType: 'bottom right',
      clickPos: { x: 200, y: 200 },
      targetSize: { x: 200, y: 200 },
      expectedPos: { x: 1, y: 1 },
    },
    {
      testType: 'bottom right, larger size',
      clickPos: { x: 2000, y: 0 },
      targetSize: { x: 2000, y: 2000 },
      expectedPos: { x: 1, y: 0 },
    },
  ])(
    "takes a click event: $testType and returns an object with x and y properties containing the click position as a percentage of element's size",
    async ({ clickPos, targetSize, expectedPos }) => {
      // Tried to do this the "proper" way with testing library, screen.getByRole('img') and then using click/pointer events.
      // However, rendered elements seem to have no dimensions, therefore it will be impossible to test where the click happens.
      // All the values used by the function (which I know exist on the events triggered by react) just don't seem to exist
      // on the fake event object that's passed to it.
      // E.g. what I was trying previously, and had no luck with.
      // // Set img display: block, width and height, render, do below, doesn't work.
      // await user.pointer({
      //   keys: '[MouseLeft]',
      //   target: screen.getByRole('img'),
      //   coords: { x: 200, y: 100 },
      // });

      const pos = getElementClickPos({
        nativeEvent: {
          offsetX: clickPos.x,
          offsetY: clickPos.y,
        },
        currentTarget: {
          clientWidth: targetSize.x,
          clientHeight: targetSize.y,
        },
      });

      expect(pos.x).toBeCloseTo(expectedPos.x, 5);
      expect(pos.y).toBeCloseTo(expectedPos.y, 5);
    },
  );
});
