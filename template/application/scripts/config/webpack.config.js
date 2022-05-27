const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const resolve = require('resolve');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const DirectoryNamedWebpackPlugin = require('directory-named-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const ESLintPlugin = require('eslint-webpack-plugin');
const InterpolateHtmlPlugin = require('tiger-new-utils/InterpolateHtmlPlugin');
const getCSSModuleLocalIdent = require('tiger-new-utils/getCSSModuleLocalIdent');
const InlineChunkHtmlPlugin = require('tiger-new-utils/InlineChunkHtmlPlugin');
const ImageMinimizerPlugin = require('tiger-new-utils/ImageMinimizerPlugin');
const ModuleNotFoundPlugin = require('tiger-new-utils/ModuleNotFoundPlugin');
const ForkTsCheckerWebpackPlugin = require('tiger-new-utils/ForkTsCheckerWebpackPlugin');
const typescriptFormatter = require('tiger-new-utils/typescriptFormatter');
const createEnvironmentHash = require('tiger-new-utils/createEnvironmentHash');
const getClientEnvironment = require('./env');
const htmlAttrsOptions = require('./htmlAttrsOptions');
const paths = require('./paths');
const tsconfig = require(paths.appTsConfig);
const pkg = paths.appPackageJson;

const webpackDevClientEntry = require.resolve('tiger-new-utils/webpackHotDevClient');
const reactRefreshOverlayEntry = require.resolve('tiger-new-utils/refreshOverlayInterop');

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
    const shouldUseReactRefresh = paths.useReactRefresh;
    const shouldUseWebpackCache = process.env.DISABLE_WEBPACK_CACHE !== 'true';

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
                    postcssOptions: {
                        ident: 'postcss',
                        plugins: [
                            pkg.useRem && [
                                'postcss-pxtorem',
                                {
                                    rootValue: 14,
                                    propList: ['*'],
                                    selectorBlackList: [/^html$/i, /\.px-/],
                                    mediaQuery: false
                                }
                            ],
                            'postcss-flexbugs-fixes',
                            [
                                'postcss-preset-env',
                                {
                                    autoprefixer: {
                                        flexbox: 'no-2009'
                                    },
                                    stage: 3
                                }
                            ]
                        ].filter(Boolean)
                    },
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
                                  javascriptEnabled: true,
                                  rewriteUrls: 'all',
                                  math: 'always'
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
                            chunksSortMode: 'manual',
                            scriptLoading: 'blocking'
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
        name: `${executionEnv}`,
        mode: isEnvProduction ? 'production' : 'development',
        bail: isEnvProduction,
        devtool: shouldUseSourceMap
            ? isBuilding
                ? isEnvProduction
                    ? isEnvNode
                        ? 'source-map'
                        : 'hidden-source-map'
                    : 'cheap-module-source-map'
                : 'cheap-module-source-map'
            : false,
        entry: isEnvNode
            ? paths.nodeEntries
            : Object.assign(
                  {
                      _vendor_: [require.resolve('./polyfills'), !isBuilding && webpackDevClientEntry]
                          .concat(pkg.vendor || [])
                          .filter(Boolean)
                  },
                  paths.entries
              ),
        target: isEnvWeb ? 'browserslist' : 'node',
        output: {
            library: isEnvNode
                ? {
                      type: 'commonjs2'
                  }
                : undefined,
            path: isEnvWeb ? paths.appBuild : paths.appNodeBuild,
            pathinfo: isEnvDevelopment,
            filename: isEnvNode
                ? '[name].js'
                : isEnvProduction
                ? 'static/js/[name].[contenthash:8].js'
                : 'static/js/[name].[fullhash:8].js',
            chunkFilename: isEnvProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].[fullhash:8].js',
            assetModuleFilename: 'static/media/[name].[hash:8][ext]',
            publicPath: paths.publicUrlOrPath,
            devtoolModuleFilenameTemplate: isEnvProduction
                ? info => path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, '/')
                : info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
        },
        externals: isEnvWeb
            ? undefined
            : [
                  nodeExternals({
                      allowlist: [/\.(?!(?:jsx?|json)$).{1,5}$/i]
                  })
              ],
        cache:
            shouldUseWebpackCache &&
            (isBuilding
                ? {
                      type: 'filesystem',
                      version: createEnvironmentHash(env.raw),
                      buildDependencies: {
                          config: [__filename]
                      }
                  }
                : true),
        infrastructureLogging: {
            level: 'none'
        },
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
                    parallel: true
                }),
                new CssMinimizerPlugin(),
                new ImageMinimizerPlugin({
                    minimizer: {
                        implementation: ImageMinimizerPlugin.imageminMinify,
                        options: {
                            plugins: [
                                'gifsicle',
                                [
                                    'mozjpeg',
                                    {
                                        quality: 60
                                    }
                                ],
                                [
                                    'pngquant',
                                    {
                                        quality: [0.7, 0.9]
                                    }
                                ],
                                'svgo'
                            ]
                        }
                    },
                    loader: true,
                    severityError: 'off'
                })
            ],
            splitChunks: {
                cacheGroups: isEnvWeb
                    ? {
                          vendors: {
                              priority: 10,
                              chunks: 'all',
                              name: 'vendor',
                              test(module, { chunkGraph }) {
                                  const chunks = Array.from(chunkGraph.getOrderedModuleChunksIterable(module));

                                  return chunks.some(chunk => chunk.name === '_vendor_');
                              }
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
                'react-hot-loader': 'tiger-new-utils/react-hot-loader',
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
                shouldUseSourceMap && {
                    enforce: 'pre',
                    exclude: /@babel(?:\/|\\{1,2})runtime/,
                    test: /\.(js|mjs|jsx|ts|tsx|css)$/,
                    use: 'source-map-loader'
                },
                {
                    oneOf: [
                        {
                            resourceQuery(query) {
                                return new URLSearchParams(query).has('raw');
                            },
                            type: 'asset/source'
                        },
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
                            test: /\.svg$/,
                            use: [
                                {
                                    loader: '@svgr/webpack',
                                    options: {
                                        prettier: false,
                                        svgo: false,
                                        titleProp: true,
                                        ref: true
                                    }
                                },
                                {
                                    loader: 'file-loader',
                                    options: {
                                        name: 'static/media/[name].[hash:8].[ext]'
                                    }
                                }
                            ],
                            type: 'javascript/auto',
                            issuer: {
                                and: [/\.(ts|tsx|js|jsx|mjs|md|mdx)$/]
                            }
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
                                    !isBuilding && isEnvWeb && shouldUseReactRefresh && 'react-refresh/babel'
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
                                              [require('@babel/plugin-proposal-class-properties').default],
                                              isEnvProduction && [
                                                  require('babel-plugin-transform-react-remove-prop-types').default,
                                                  {
                                                      removeImport: true
                                                  }
                                              ]
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
                                    getLocalIdent: getCSSModuleLocalIdent,
                                    mode: 'local'
                                }
                            })
                        },
                        {
                            test: cssRegex,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                modules: {
                                    mode: 'icss'
                                }
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
                                        getLocalIdent: getCSSModuleLocalIdent,
                                        mode: 'local'
                                    }
                                },
                                'sass-loader'
                            )
                        },
                        {
                            test: sassRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 2,
                                    modules: {
                                        mode: 'icss'
                                    }
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
                                        getLocalIdent: getCSSModuleLocalIdent,
                                        mode: 'local'
                                    }
                                },
                                'less-loader'
                            )
                        },
                        {
                            test: lessRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 2,
                                    modules: {
                                        mode: 'icss'
                                    }
                                },
                                'less-loader'
                            ),
                            sideEffects: true
                        },
                        {
                            test: /\.(txt|htm)$/,
                            type: 'asset/source'
                        },
                        {
                            exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/, /\.(txt|htm)$/],
                            type: 'asset/resource'
                        }
                    ]
                }
            ].filter(Boolean)
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
                __LOCAL_DEV__: JSON.stringify(!isBuilding),
                ...(isEnvWeb ? { 'process.env': JSON.stringify(env.raw) } : {})
            }),
            !isBuilding && new CaseSensitivePathsPlugin(),
            isBuilding &&
                new MiniCssExtractPlugin({
                    filename: isEnvProduction
                        ? 'static/css/[name].[contenthash:8].css'
                        : 'static/css/[name].[fullhash:8].css',
                    ignoreOrder: !!pkg.ignoreCssOrderWarnings || process.env.IGNORE_CSS_ORDER_WARNINGS === 'true'
                }),
            new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/locale$/,
                contextRegExp: /moment$/
            }),
            !isBuilding &&
                isEnvWeb &&
                shouldUseReactRefresh &&
                new ReactRefreshWebpackPlugin({
                    overlay: {
                        entry: webpackDevClientEntry,
                        module: reactRefreshOverlayEntry,
                        sockIntegration: false
                    }
                }),
            new ESLintPlugin({
                extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
                formatter: require.resolve('tiger-new-utils/eslintFormatter'),
                eslintPath: require.resolve('eslint'),
                context: paths.appSrc,
                cache: true,
                cacheLocation: path.resolve(paths.appNodeModules, '.cache/eslint'),
                cwd: paths.root
            }),
            (!isBuilding || isEnvWeb) &&
                process.env.DISABLE_TSC_CHECK !== 'true' &&
                new ForkTsCheckerWebpackPlugin({
                    typescript: {
                        typescriptPath: resolve.sync('typescript', {
                            basedir: paths.appNodeModules
                        }),
                        mode: 'write-references',
                        configFile: paths.appTsConfig,
                        context: paths.root,
                        configOverwrite: {
                            compilerOptions: {
                                sourceMap: shouldUseSourceMap,
                                allowJs: true,
                                checkJs: false,
                                jsx: paths.hasJsxRuntime
                                    ? isEnvProduction
                                        ? 'react-jsx'
                                        : 'react-jsxdev'
                                    : 'preserve',
                                inlineSourceMap: false,
                                declarationMap: false,
                                noEmit: true,
                                incremental: true,
                                tsBuildInfoFile: path.resolve(paths.appNodeModules, '.cache/tsbuildinfo')
                            },
                            exclude: tsconfig.exclude.concat(
                                'setupTests.ts',
                                'tests',
                                '**/*.test.*',
                                '**/*.spec.*',
                                '**/__tests__'
                            )
                        },
                        diagnosticOptions: { syntactic: true, semantic: true, declaration: false, global: false }
                    },
                    async: !isBuilding,
                    logger: { infrastructure: 'silent', issues: 'silent', devServer: false },
                    formatter: isBuilding ? typescriptFormatter : undefined
                }),
            isBuilding &&
                new webpack.BannerPlugin({
                    test: /\.(js|css)$/,
                    banner: `@author ${pkg.author}`,
                    entryOnly: true
                })
        ].filter(Boolean),
        ignoreWarnings: [/Failed to parse source map/],
        stats: 'none',
        snapshot: {
            managedPaths: [/node_modules\/.*\/(node_modules)/]
        },
        // Turn off performance processing because we utilize
        // our own hints via the FileSizeReporter
        performance: false
    };
};
