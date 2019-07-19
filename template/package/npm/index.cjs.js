if (process.env.NODE_ENV === 'production') {
    module.exports = require('./{name}.cjs.production.js');
} else {
    module.exports = require('./{name}.cjs.development.js');
}
