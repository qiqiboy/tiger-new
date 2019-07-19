if (process.env.NODE_ENV === 'production') {
    module.exports = require('./react-hooks.esm.production.js');
} else {
    module.exports = require('./react-hooks.esm.development.js');
}
