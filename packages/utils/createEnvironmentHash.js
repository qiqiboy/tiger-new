'use strict';
const { createHash } = require('crypto');
const lodash = require('lodash');

module.exports = env => {
  const hash = createHash('md5');
  hash.update(JSON.stringify(lodash.omit(env, 'BASE_NAME')));

  return hash.digest('hex');
};
