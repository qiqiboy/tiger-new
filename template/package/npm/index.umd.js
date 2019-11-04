if (process.env.NODE_ENV === 'production') {
    module.exports = require('./pmer.umd.production.js');
} else {
    module.exports = require('./pmer.umd.development.js');
}
