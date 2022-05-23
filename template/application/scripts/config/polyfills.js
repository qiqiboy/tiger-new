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
require('core-js/actual/object');
require('core-js/actual/promise');
require('core-js/actual/map');
require('core-js/actual/set');
require('core-js/actual/array');
require('core-js/actual/string');
require('core-js/actual/number');
require('core-js/actual/symbol');
require('core-js/actual/global-this');
require('core-js/actual/url');
