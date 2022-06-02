/* eslint @typescript-eslint/no-var-requires: 0 */
if (typeof window !== 'undefined') {
    // classList
    require('classlist-polyfill');

    // requestAnimationFrame
    require('raf-dom').polyfill();

    // fix IE10 location.origin
    if (typeof window.location.origin === 'undefined') {
        window.location.origin = `${window.location.protocol}//${window.location.host}`;
    }
}

// ECMAScript
require('core-js/features/object');
require('core-js/features/promise');
require('core-js/features/map');
require('core-js/features/set');
require('core-js/features/array');
require('core-js/features/string');
require('core-js/features/number');
require('core-js/features/symbol');
require('core-js/features/global-this');
require('core-js/features/url');
