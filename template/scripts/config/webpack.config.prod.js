var path = require('path');
var fs = require('fs-extra');
var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
var ImageminPlugin = require('imagemin-webpack-plugin').default;
var paths = require('./paths');
var getClientEnvironment = require('./env');
var pkg = require(paths.appPackageJson);

function ensureSlash(path, needsSlash) {
    var hasSlash = path.endsWith('/');
    if (hasSlash && !needsSlash) {
        return path.substr(path, path.length - 1);
    } else if (!hasSlash && needsSlash) {
        return path + '/';
    } else {
        return path;
    }
}

var cdnUrl = pkg.cdn.host + pkg.cdn.path;
var publicPath = ensureSlash(cdnUrl, true);
var publicUrl = ensureSlash(cdnUrl, false);
// Get environment variables to inject into our app.
var env = getClientEnvironment(publicUrl);

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env['process.env'].NODE_ENV !== '"production"') {
    throw new Error('Production builds must have NODE_ENV=production.');
}

var injects = [
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: Infinity
    })
];

var matchScriptStylePattern = /<\!--\s*script:\s*([\w]+)(?:\.jsx?)?\s*-->/g;

paths.pageEntries
    .forEach(function(name) {
        var chunks = ['vendor'];
        var file = path.resolve(paths.appPublic, name + '.html');

        if (paths.entries[name]) {
            chunks.push(name);
        }

        var contents = fs.readFileSync(file);
        var matches;

        while ((matches = matchScriptStylePattern.exec(contents))) {
            chunks.push(matches[1]);
        }

        injects.push(new HtmlWebpackPlugin({
            chunks: chunks,
            filename: name + '.html',
            template: file,
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            }
        }));
    });

var webpackConfig = {
    bail: true,
    //devtool: 'cheap-module-source-map',
    entry: Object.assign(paths.entries, {
        vendor: [
            require.resolve('./polyfills')
        ].concat(pkg.vendor || [])
    }),
    output: {
        path: paths.appBuild,
        filename: 'static/js/[name].[chunkhash:8].js',
        chunkFilename: 'static/js/[name].chunk.[chunkhash:8].js',
        publicPath: publicPath
    },
    resolve: {
        fallback: paths.nodePaths,
        extensions: ['.js', '.json', '.jsx', ''],
        alias: Object.assign({
            'react-native': 'react-native-web'
        }, paths.alias),
        root: paths.root
    },

    module: {
        // First, run the linter.
        // It's important to do this before Babel processes the JS.
        preLoaders: [{
            test: /\.(js|jsx)$/,
            loader: 'eslint',
            include: paths.appSrc
        }],
        loaders: [{
            exclude: [],
            loader: 'file',
            query: {
                name: 'static/images/[name].[hash:8].[ext]'
            }
        }, {
            test: /\.html$/,
            loader: 'html-loader',
            query: {
                interpolate: 'require',
                root: paths.staticSrc,
                attrs: ['img:src', 'img:data-src', 'video:src', 'source:src', 'audio:src', 'script:src', 'link:href']
            }
        }, {
            test: /\.(js|jsx)$/,
            include: [paths.appSrc, paths.staticSrc],
            loader: 'babel'
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style', 'css?importLoaders=1!postcss')
        }, {
            test: /\.s[ac]ss$/,
            loader: ExtractTextPlugin.extract('style', 'css?importLoaders=2!postcss!sass')
        }, {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract('style', 'css?importLoaders=2!postcss!less')
        }, {
            test: /\.json$/,
            loader: 'json'
        }, {
            test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
            loader: 'file',
            query: {
                name: 'static/media/[name].[hash:8].[ext]'
            }
        }]
    },

    postcss: function() {
        return [
            autoprefixer({
                browsers: [
                    '>1%',
                    'last 4 versions',
                    'iOS 7',
                    'Firefox ESR',
                    'not ie < 9', // React doesn't support IE8 anyway
                ]
            }),
        ];
    },
    plugins: injects.concat([
        new InterpolateHtmlPlugin({
            PUBLIC_URL: '.' //publicUrl
        }),
        new ImageminPlugin({
            pngquant: {
                //quality: '95-100'
            }
        }),
        new webpack.DefinePlugin(env),
        // This helps ensure the builds are consistent if source hasn't changed:
        new webpack.optimize.OccurrenceOrderPlugin(),
        // Try to dedupe duplicated modules, if any:
        new webpack.optimize.DedupePlugin(),
        // Minify the code.
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true, // React doesn't support IE8
                warnings: false
            },
            mangle: {
                screw_ie8: true
            },
            output: {
                comments: false,
                screw_ie8: true
            }
        }),
        new ExtractTextPlugin('static/css/[name].[contenthash:8].css', {
            allChunks: true
        }),
        new webpack.BannerPlugin('@author ' + pkg.author)
    ]),
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
};

var excludeLoader = webpackConfig.module.loaders[0];
excludeLoader.exclude = excludeLoader.exclude.concat(webpackConfig.module.loaders.slice(1).map(function(config) {
    return config.test;
}));

module.exports = webpackConfig;
