if (process.env.NODE_ENV === 'production') {
    module.exports = require('./{name}.esm.production.js');
} else {
    module.exports = require('./{name}.esm.development.js');
}
