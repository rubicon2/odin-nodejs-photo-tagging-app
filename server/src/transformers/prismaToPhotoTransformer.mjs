import createImgUrl from '../ext/createImgUrl.mjs';
import transformer, { copy } from '@rubicon2/object-transformer';

const rules = {
  url: copy({ parser: createImgUrl }),
  '_count.tags': copy({ key: 'tagCount' }),
};

export default transformer(rules);
