const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const resolve = require('resolve');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const DirectoryNamedWebpackPlugin = require('directory-named-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const getClientEnvironment = require('./env');
const htmlAttrsOptions = require('./htmlAttrsOptions');
const paths = require('./paths');
const pkg = require(paths.appPackageJson);

const isBuilding = process.env.WEBPACK_BUILDING === 'true';
const shouldUseRelativeAssetPath = !paths.publicUrlOrPath.startsWith('http');
// style files regexes
const cssRegex = /\.css$/;
const sassRegex = /\.(scss|sass)$/;
const lessRegex = /\.less$/;

// This is the production and development configuration.
module.exports = function(webpackEnv, executionEnv = 'web') {
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';
    const isEnvProductionProfile = isEnvProduction && process.argv.includes('--profile');
    const isEnvNode = paths.useNodeEnv && executionEnv === 'node';
    const isEnvWeb = !isEnvNode;

    const shouldUseSourceMap = isEnvProduction
        ? process.env.GENERATE_SOURCEMAP === 'true'
        : process.env.GENERATE_SOURCEMAP !== 'false';
    const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';
    const shouldUseSW = process.env.GENERATE_SW === 'true' || !!pkg.pwa;

    const env = getClientEnvironment({
        PUBLIC_URL: paths.publicUrlOrPath.slice(0, -1),
        RUNTIME: executionEnv,
        RUNTIME_MODE: isEnvNode ? 'ssr' : 'csr',
        ENABLE_SSR: paths.useNodeEnv,
        ENABLE_PWA: shouldUseSW
    });

    const babelOption = {
        babelrc: false,
        configFile: false,
        compact: false,
        presets: [[require.resolve('babel-preset-react-app/dependencies'), { helpers: true }]],
        cacheDirectory: true,
        cacheCompression: false,
        sourceMaps: shouldUseSourceMap,
        inputSourceMap: shouldUseSourceMap
    };

    const getStyleLoaders = (cssOptions, preProcessor) => {
        if (isEnvNode) {
            return [require.resolve('null-loader')];
        }

        const loaders = [
            isBuilding
                ? {
                      loader: MiniCssExtractPlugin.loader,
                      options: {
                          publicPath: shouldUseRelativeAssetPath ? '../../' : undefined,
                          esModule: true
                      }
                  }
                : require.resolve('style-loader'),
            {
                loader: require.resolve('css-loader'),
                options: Object.assign({ sourceMap: shouldUseSourceMap }, cssOptions)
            },
            {
                loader: require.resolve('postcss-loader'),
                options: {
                    ident: 'postcss',
                    plugins: () => [
                        require('postcss-flexbugs-fixes'),
                        require('postcss-preset-env')({
                            autoprefixer: {
                                flexbox: 'no-2009'
                            },
                            stage: 3
                        })
                    ],
                    sourceMap: shouldUseSourceMap
                }
            }
        ].filter(Boolean);

        if (preProcessor) {
            loaders.push({
                loader: require.resolve(preProcessor),
                options: Object.assign(
                    {},
                    { sourceMap: shouldUseSourceMap },
                    preProcessor === 'less-loader'
                        ? {
                              lessOptions: {
                                  javascriptEnabled: true
                              }
                          }
                        : {
                              implementation: require('sass')
                          }
                )
            });
        }

        return loaders;
    };

    // eslint-disable-next-line
    const matchScriptStylePattern = /<\!--\s*script:\s*([\w]+)(?:\.[jt]sx?)?\s*-->/g;
    const htmlInjects = [];

    if (isEnvWeb) {
        Object.keys(paths.pageEntries).forEach(function(name) {
            const chunks = ['_vendor_'];
            const file = paths.pageEntries[name];
            const nodeFile = paths.nodePageEntries[name];

            if (paths.entries[name]) {
                chunks.push(name);
            }

            const contents = fs.readFileSync(file);
            let matches;

            while ((matches = matchScriptStylePattern.exec(contents))) {
                chunks.push(matches[1]);
            }

            const createHtmlWebpaclPlugin = function(filename, template) {
                return new HtmlWebpackPlugin(
                    Object.assign(
                        {
                            chunks: chunks,
                            filename,
                            template,
                            inject: true,
                            chunksSortMode: 'manual'
                        },
                        isEnvProduction
                            ? {
                                  minify: {
                                      ignoreCustomComments: [/^\s+(your\shtml|root)\s+$/],
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
                              }
                            : undefined
                    )
                );
            };

            htmlInjects.push(createHtmlWebpaclPlugin(`${name}.html`, file || nodeFile));

            paths.useNodeEnv &&
                htmlInjects.push(
                    createHtmlWebpaclPlugin(path.join(paths.appNodeBuild, `${name}.html`), nodeFile || file)
                );
        });
    }

    return {
        mode: isEnvProduction ? 'production' : 'development',
        bail: isEnvProduction,
        devtool: shouldUseSourceMap
            ? isBuilding
                ? isEnvProduction
                    ? isEnvNode
                        ? 'source-map'
                        : 'hidden-source-map'
                    : 'cheap-module-source-map'
                : 'eval-cheap-module-source-map'
            : false,
        entry: isEnvNode
            ? paths.nodeEntries
            : Object.assign(
                  {
                      _vendor_: [
                          require.resolve('./polyfills'),
                          !isBuilding && require.resolve('react-dev-utils/webpackHotDevClient'),
                          !isBuilding && 'react-hot-loader/patch'
                      ]
                          .concat(pkg.vendor || [])
                          .filter(Boolean)
                  },
                  paths.entries
              ),
        target: isEnvWeb ? 'web' : 'node',
        output: {
            libraryTarget: isEnvNode ? 'commonjs2' : undefined,
            path: isEnvWeb ? paths.appBuild : paths.appNodeBuild,
            pathinfo: isEnvDevelopment,
            filename: isEnvNode
                ? '[name].js'
                : isEnvProduction
                    ? 'static/js/[name].[contenthash:8].js'
                    : 'static/js/[name].[hash:8].js',
            // TODO: remove this when upgrading to webpack 5
            futureEmitAssets: true,
            chunkFilename: isEnvProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].[hash:8].js',
            publicPath: paths.publicUrlOrPath,
            devtoolModuleFilenameTemplate: isEnvProduction
                ? info => path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, '/')
                : info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
            jsonpFunction: `webpackJsonp${pkg.name}`,
            globalObject: isEnvWeb ? 'this' : 'global'
        },
        externals: isEnvWeb
            ? undefined
            : [
                  nodeExternals({
                      allowlist: [/\.(?!(?:jsx?|json)$).{1,5}$/i]
                  })
              ],
        optimization: {
            minimize: isEnvProduction,
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                    terserOptions: {
                        parse: {
                            ecma: 8
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            comparisons: false,
                            inline: 2
                        },
                        mangle: {
                            safari10: true
                        },
                        keep_classnames: isEnvProductionProfile,
                        keep_fnames: isEnvProductionProfile,
                        output: {
                            ecma: 5,
                            comments: /@(license|author)/i,
                            ascii_only: true
                        }
                    },
                    parallel: true,
                    cache: true,
                    sourceMap: shouldUseSourceMap
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: {
                        parser: safePostCssParser,
                        map: shouldUseSourceMap
                            ? {
                                  inline: false,
                                  annotation: isEnvDevelopment
                              }
                            : false
                    },
                    cssProcessorPluginOptions: {
                        preset: ['default', { minifyFontValues: { removeQuotes: false } }]
                    }
                })
            ],
            splitChunks: {
                chunks: 'async',
                name: false,
                cacheGroups: isEnvWeb
                    ? {
                          vendors: {
                              priority: 10,
                              chunks: 'all',
                              test: '_vendor_',
                              name: 'vendor'
                          },
                          i18n: {
                              priority: 100,
                              chunks: 'all',
                              test: /locals\/\w+\.json$/,
                              enforce: true,
                              name: 'i18n'
                          }
                      }
                    : {}
            },
            runtimeChunk: isEnvWeb ? 'single' : false
        },
        resolve: {
            modules: ['node_modules', paths.appNodeModules, paths.root].concat(paths.nodePaths),
            extensions: (isEnvWeb ? paths.webModuleFileExtensions : paths.nodeModuleFileExtensions).map(
                ext => `.${ext}`
            ),
            alias: {
                'react-native': 'react-native-web',
                ...(isEnvProductionProfile && {
                    'react-dom$': 'react-dom/profiling',
                    'scheduler/tracing': 'scheduler/tracing-profiling'
                }),
                ...paths.moduleAlias
            },
            plugins: [
                new DirectoryNamedWebpackPlugin({
                    honorIndex: true,
                    exclude: /node_modules|libs/
                })
            ]
        },
        module: {
            strictExportPresence: true,
            rules: [
                { parser: { requireEnsure: false } },
                {
                    test: /\.(js|mjs|jsx|ts|tsx)$/,
                    enforce: 'pre',
                    use: [
                        {
                            options: {
                                cache: true,
                                formatter: require.resolve('react-dev-utils/eslintFormatter'),
                                eslintPath: require.resolve('eslint'),
                                resolvePluginsRelativeTo: __dirname
                            },
                            loader: require.resolve('eslint-loader')
                        }
                    ],
                    include: paths.appSrc
                },
                {
                    oneOf: [
                        {
                            test: /\.html$/,
                            use: [
                                {
                                    loader: require.resolve('babel-loader'),
                                    options: babelOption
                                },
                                {
                                    loader: require.resolve('html-loader'),
                                    options: htmlAttrsOptions
                                }
                            ]
                        },
                        {
                            test: /\.(js|mjs|jsx|ts|tsx)$/,
                            include: paths.appSrc,
                            loader: require.resolve('babel-loader'),
                            options: {
                                customize: require.resolve('babel-preset-react-app/webpack-overrides'),
                                presets: [
                                    [
                                        'react-app',
                                        {
                                            runtime: paths.hasJsxRuntime ? 'automatic' : 'classic'
                                        }
                                    ]
                                ],
                                plugins: [
                                    require.resolve('babel-plugin-auto-css-modules-flag'),
                                    [
                                        require.resolve('babel-plugin-named-asset-import'),
                                        {
                                            loaderMap: {
                                                svg: {
                                                    ReactComponent: '@svgr/webpack?-svgo,+titleProp,+ref![path]'
                                                }
                                            }
                                        }
                                    ],
                                    !isBuilding && isEnvWeb && 'react-hot-loader/babel'
                                ].filter(Boolean),
                                cacheDirectory: true,
                                cacheCompression: false,
                                compact: isEnvProduction,
                                ...(isEnvWeb
                                    ? {}
                                    : {
                                          babelrc: false,
                                          configFile: false,
                                          presets: [
                                              [
                                                  require('@babel/preset-env').default,
                                                  {
                                                      targets: {
                                                          node: 10
                                                      },
                                                      useBuiltIns: 'entry',
                                                      corejs: 3,
                                                      exclude: ['transform-typeof-symbol']
                                                  }
                                              ],
                                              [
                                                  require('@babel/preset-react').default,
                                                  {
                                                      development: isEnvDevelopment,
                                                      ...(!paths.hasJsxRuntime ? { useBuiltIns: true } : {}),
                                                      runtime: paths.hasJsxRuntime ? 'automatic' : 'classic'
                                                  }
                                              ],
                                              [require('@babel/preset-typescript').default]
                                          ],
                                          plugins: [
                                              ...(pkg.babel && pkg.babel.plugins),
                                              [
                                                  require('@babel/plugin-proposal-class-properties').default,
                                                  {
                                                      loose: true
                                                  }
                                              ],
                                              isEnvProduction && [
                                                  require('babel-plugin-transform-react-remove-prop-types').default,
                                                  {
                                                      removeImport: true
                                                  }
                                              ],
                                              require('@babel/plugin-proposal-numeric-separator').default,
                                              require('@babel/plugin-proposal-optional-chaining').default,
                                              require('@babel/plugin-proposal-nullish-coalescing-operator').default
                                          ].filter(Boolean)
                                      })
                            }
                        },
                        {
                            test: /\.(js|mjs)$/,
                            exclude: /@babel(?:\/|\\{1,2})runtime/,
                            loader: require.resolve('babel-loader'),
                            options: babelOption
                        },
                        {
                            test: cssRegex,
                            resourceQuery: /modules/,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                modules: {
                                    getLocalIdent: getCSSModuleLocalIdent
                                }
                            })
                        },
                        {
                            test: cssRegex,
                            use: getStyleLoaders({
                                importLoaders: 1
                            }),
                            sideEffects: true
                        },
                        {
                            test: sassRegex,
                            resourceQuery: /modules/,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 2,
                                    modules: {
                                        getLocalIdent: getCSSModuleLocalIdent
                                    }
                                },
                                'sass-loader'
                            )
                        },
                        {
                            test: sassRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 2
                                },
                                'sass-loader'
                            ),
                            sideEffects: true
                        },
                        {
                            test: lessRegex,
                            resourceQuery: /modules/,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 2,
                                    modules: {
                                        getLocalIdent: getCSSModuleLocalIdent
                                    }
                                },
                                'less-loader'
                            )
                        },
                        {
                            test: lessRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 2
                                },
                                'less-loader'
                            ),
                            sideEffects: true
                        },
                        {
                            test: /\.(txt|htm)$/,
                            loader: require.resolve('raw-loader')
                        },
                        {
                            test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)$/,
                            loader: require.resolve('file-loader'),
                            options: {
                                name: 'static/media/[name].[hash:8].[ext]',
                                esModule: true
                            }
                        },
                        {
                            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/, /\.(txt|htm)$/],
                            loader: require.resolve('file-loader'),
                            options: {
                                name: 'static/images/[name].[hash:8].[ext]',
                                esModule: true
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            ...htmlInjects,
            isEnvWeb &&
                fs.existsSync(path.join(paths.appSrc, 'utils/i18n')) &&
                new webpack.ProvidePlugin({
                    __: ['utils/i18n', '__']
                }),
            isBuilding &&
                shouldInlineRuntimeChunk &&
                new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime\.\w+[.]js/]),
            new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
            new ModuleNotFoundPlugin(paths.root),
            new webpack.EnvironmentPlugin(env.raw),
            new webpack.DefinePlugin({
                __SSR__: JSON.stringify(paths.useNodeEnv && executionEnv),
                __DEV__: JSON.stringify(isEnvDevelopment),
                __LOCAL_DEV__: JSON.stringify(!isBuilding)
            }),
            !isBuilding && new CaseSensitivePathsPlugin(),
            !isBuilding && new WatchMissingNodeModulesPlugin(paths.appNodeModules),
            isEnvProduction &&
                new ImageminPlugin({
                    cacheFolder: path.resolve(paths.appNodeModules, '.cache/imagemin'),
                    pngquant: {
                        // quality: '95-100'
                    }
                }),
            isBuilding &&
                new MiniCssExtractPlugin({
                    filename: isEnvProduction
                        ? 'static/css/[name].[contenthash:8].css'
                        : 'static/css/[name].[hash:8].css',
                    ignoreOrder: !!pkg.ignoreCssOrderWarnings || process.env.IGNORE_CSS_ORDER_WARNINGS === 'true'
                }),
            new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/locale$/,
                contextRegExp: /moment$/
            }),
            isEnvProduction &&
                isEnvWeb &&
                shouldUseSW &&
                new SWPrecacheWebpackPlugin({
                    cacheId: pkg.name,
                    dontCacheBustUrlsMatching: /\.\w{8}\./,
                    filename: 'service-worker.js',
                    logger(message) {
                        if (message.indexOf('Total precache size is') === 0) {
                            // This message occurs for every build and is a bit too noisy.
                            return;
                        }

                        if (message.indexOf('Skipping static resource') === 0) {
                            // This message obscures real errors so we ignore it.
                            // https://github.com/facebookincubator/create-react-app/issues/2612
                            return;
                        }

                        console.log(message);
                    },
                    minify: true,

                    mergeStaticsConfig: true,
                    staticFileGlobs: `${path.basename(paths.appBuild)}/*.html`,
                    stripPrefix: `${path.basename(paths.appBuild)}/`,

                    // For unknown URLs, fallback to the index page
                    navigateFallback:
                        getPublicUrlOrPath(false, process.env.BASE_NAME || pkg.homepage || process.env.PUBLIC_URL) +
                        path.basename(paths.appHtml),
                    // Ignores URLs starting from /__ (useful for Firebase):
                    // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
                    navigateFallbackWhitelist: [/^(?!\/__).*/],
                    // Don't precache sourcemaps (they're large) and build asset manifest:
                    // /^\/.*\.html$/ 去掉webpack编译阶段由html-webpack-plugin带入的入口html文件
                    // 因为这种文件是绝对路径，以 / 开头的
                    staticFileGlobsIgnorePatterns: [/\.map$/, /manifest\.json$/, /^\/.*\.html$/]
                }),
            (!isBuilding || isEnvWeb) &&
                process.env.DISABLE_TSC_CHECK !== 'true' &&
                new ForkTsCheckerWebpackPlugin({
                    typescript: resolve.sync('typescript', {
                        basedir: paths.appNodeModules
                    }),
                    async: !isBuilding,
                    useTypescriptIncrementalApi: true,
                    checkSyntacticErrors: true,
                    tsconfig: paths.webpackTsConfig,
                    compilerOptions: {
                        jsx: paths.hasJsxRuntime ? (isEnvProduction ? 'react-jsx' : 'react-jsxdev') : 'preserve',
                        checkJs: false
                    },
                    silent: true,
                    formatter: isBuilding ? typescriptFormatter : undefined
                }),
            new webpack.BannerPlugin({
                banner: `@author ${pkg.author}`,
                entryOnly: true
            })
        ].filter(Boolean),
        // Some libraries import Node modules but don't use them in the browser.
        // Tell webpack to provide empty mocks for them so importing them works.
        node: {
            __filename: isEnvWeb,
            __dirname: isEnvWeb,
            module: 'empty',
            dgram: 'empty',
            dns: 'mock',
            fs: 'empty',
            http2: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty'
        },
        // Turn off performance processing because we utilize
        // our own hints via the FileSizeReporter
        performance: false
    };
};
