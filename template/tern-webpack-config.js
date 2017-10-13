const path = require('path');

module.exports = {
    resolve: {
        alias: {
            utils: path.resolve(__dirname, 'app/utils'),
            components: path.resolve(__dirname, 'app/components'),
            modules: path.resolve(__dirname, 'app/modules'),
            libs: path.resolve(__dirname, 'libs')
        }
    }
}
