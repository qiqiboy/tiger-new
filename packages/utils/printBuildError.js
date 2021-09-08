/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const chalk = require('chalk');

module.exports = function(err) {
    const message = err != null && err.message;
    const stack = err != null && err.stack;

    // Add more helpful message for Terser error
    if (stack && typeof message === 'string' && message.indexOf('from Terser') !== -1) {
        try {
            const matched = /(.+)\[(.+):(.+),(.+)\]\[.+\]/.exec(stack);

            if (!matched) {
                throw new Error('Using errors for control flow is bad.');
            }

            const problemPath = matched[2];
            const line = matched[3];
            const column = matched[4];

            console.log(
                '代码压缩有异常: \n\n',
                chalk.yellow(`\t${problemPath}:${line}${column !== '0' ? `:${column}` : ''}`),
                '\n'
            );
        } catch (ignored) {
            console.log('代码压缩出现异常.', err);
        }
    } else if (message || err) {
        console.log(`${message || err}\n`);
    }

    console.log();
}
