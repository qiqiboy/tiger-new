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
    attributes: {
        list: [
            {
                tag: 'audio',
                attribute: 'src',
                type: 'src'
            },
            {
                tag: 'embed',
                attribute: 'src',
                type: 'src'
            },
            {
                tag: 'img',
                attribute: 'src',
                type: 'src'
            },
            {
                tag: 'img',
                attribute: 'srcset',
                type: 'srcset'
            },

            {
                tag: 'img',
                attribute: 'data-src',
                type: 'src'
            },
            {
                tag: 'img',
                attribute: 'data-srcset',
                type: 'srcset'
            },
            {
                tag: 'input',
                attribute: 'src',
                type: 'src'
            },
            {
                tag: 'link',
                attribute: 'href',
                type: 'src',
                filter: (tag, attribute, attributes) => {
                    if (
                        /image/i.test(getAttributeValue(attributes, 'type')) ||
                        /icon/i.test(getAttributeValue(attributes, 'rel'))
                    ) {
                        return true;
                    }

                    if (!/stylesheet/i.test(getAttributeValue(attributes, 'rel'))) {
                        return false;
                    }

                    if (attributes.type && getAttributeValue(attributes, 'type').trim().toLowerCase() !== 'text/css') {
                        return false;
                    }

                    if (!/\.file\.(sass|scss|less|css)$/) {
                        return false;
                    }

                    return true;
                }
            },
            {
                tag: 'object',
                attribute: 'data',
                type: 'src'
            },
            {
                tag: 'script',
                attribute: 'src',
                type: 'src'
            },
            {
                tag: 'source',
                attribute: 'src',
                type: 'src'
            },
            {
                tag: 'source',
                attribute: 'srcset',
                type: 'srcset'
            },
            {
                tag: 'track',
                attribute: 'src',
                type: 'src'
            },
            {
                tag: 'video',
                attribute: 'poster',
                type: 'src'
            },
            {
                tag: 'video',
                attribute: 'src',
                type: 'src'
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
        },
        root: paths.root
    },
    preprocessor: (content, loaderContext) => {
        return content.replace(/"(static|app)\//g, `"~$1/`);
    }
};
