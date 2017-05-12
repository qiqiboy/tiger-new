var path = require('path');
var fs = require('fs-extra');
var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
var InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
var WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
var getClientEnvironment = require('./env');
var paths = require('./paths');
var pkg = require(paths.appPackageJson);

var publicPath = '/';
var publicUrl = '';
var env = getClientEnvironment(publicUrl);
var injects = [
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: Infinity
    })
];

var matchScriptStylePattern = /<\!--\s*script:\s*([\w]+)(?:\.jsx?)?\s*-->/g;
//console.log(paths);process.exit();
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
            inject: true
        }));
    });

var webpackConfig = {
    devtool: 'eval',
    entry: Object.assign(paths.entries, {
        vendor: [
            require.resolve('react-dev-utils/webpackHotDevClient'),
            require.resolve('./polyfills')
        ].concat(pkg.vendor || [])
    }),
    output: {
        path: paths.appBuild,
        pathinfo: true,
        filename: 'static/js/[name].[hash:8].js',
        chunkFilename: 'static/js/[name].bundle.[hash:8].js',
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
        preLoaders: [{
            test: /\.(js|jsx)$/,
            loader: 'eslint',
            include: paths.appSrc,
        }],
        loaders: [{
            exclude: [],
            loader: 'file',
            query: {
                name: 'static/images/[name].[hash:8].[ext]'
            }
        }, {
            test: /\.html$/,
            loader: 'html',
            query: {
                interpolate: 'require',
                root: paths.staticSrc,
                attrs: ['img:src', 'img:data-src', 'video:src', 'source:src', 'audio:src', 'script:src', 'link:href']
            }
        }, {
            test: /\.(js|jsx)$/,
            include: [paths.appSrc, paths.staticSrc],
            loaders: ['react-hot', 'babel?' + JSON.stringify({
                cacheDirectory: true
            })]
        }, {
            test: /\.css$/,
            loader: 'style!css?importLoaders=1!postcss'
        }, {
            test: /\.s[ac]ss$/,
            loader: 'style!css?importLoaders=2!postcss!sass'
        }, {
            test: /\.less$/,
            loader: 'style!css?importLoaders=2!postcss!less'
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
                    'Firefox ESR',
                    'not ie < 9', // React doesn't support IE8 anyway
                ]
            }),
        ];
    },
    plugins: injects.concat([
        new InterpolateHtmlPlugin({
            PUBLIC_URL: publicUrl
        }),
        new webpack.DefinePlugin(env),
        new webpack.HotModuleReplacementPlugin(),
        new CaseSensitivePathsPlugin(),
        new WatchMissingNodeModulesPlugin(paths.appNodeModules),
        new webpack.BannerPlugin('@author ' + (pkg.author || 'imqiqiboy@gmail.com'))
    ]),
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
