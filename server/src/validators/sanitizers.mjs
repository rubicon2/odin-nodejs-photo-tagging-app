const getImageIdFromRouteSanitizer = (value, { req }) => {
  // Really regretting throwing around photoId and imageId interchangably now.
  if (req.params?.photoId) return req.params?.photoId;
  if (req.params?.imageId) return req.params?.imageId;
  throw new Error(`imageId/photoId param does not exist on this route`);
};

export { getImageIdFromRouteSanitizer };
