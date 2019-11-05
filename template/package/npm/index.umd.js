if (process.env.NODE_ENV === 'production') {
    module.exports = require('./{name}.umd.production.js');
} else {
    module.exports = require('./{name}.umd.development.js');
}
