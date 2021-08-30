const paths = require('./paths');

function getAttributeValue(attributes, name) {
    const lowercasedAttributes = Object.keys(attributes).reduce((keys, k) => {
        // eslint-disable-next-line no-param-reassign
        keys[k.toLowerCase()] = k;

        return keys;
    }, {});

    return attributes[lowercasedAttributes[name.toLowerCase()]];
}

module.exports = {
    minimize: false,
    esModule: false,
    sources: {
        list: [
            '...',
            {
                tag: 'img',
                attribute: 'data-src',
                type: 'src'
            },
            {
                tag: 'img',
                attribute: 'data-srcset',
                type: 'srcset'
            }
        ],
        urlFilter: (attribute, value, resourcePath) => {
            /**
             * Urls must ends with file extension。If urls has query params, ignore them.
             * Will process: url.jpeg
             * Not process: url.jpeg?xx
             */
            if (/\.(webp|png|jpeg|jpg|gif|ico|svg|mp3|mp4|wmv|mp4|ogg|webm|s[ac]ss|css|less|m?[tj]sx?)$/.test(value)) {
                return true;
            }

            return false;
        }
    },
    preprocessor: (content, loaderContext) => {
        return content.replace(/"(static|app)\//g, `"~$1/`);
    }
};
