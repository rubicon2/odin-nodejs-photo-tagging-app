import transformer, { copy } from '@rubicon2/object-transformer';

const rangeParser = (tolerance) => {
  return (v) => ({
    lte: v + tolerance,
    gte: v - tolerance,
  });
};

export default function createPostCheckTagQueryTransformer(tolerance) {
  const rules = {
    photoId: copy({ key: 'where.imageId' }),
    posX: copy({ key: 'where.posX', parser: rangeParser(tolerance) }),
    posY: copy({ key: 'where.posY', parser: rangeParser(tolerance) }),
  };

  const options = {
    omitRulelessKeys: true,
    omitEmptyStrings: true,
  };

  return transformer(rules, options);
}
