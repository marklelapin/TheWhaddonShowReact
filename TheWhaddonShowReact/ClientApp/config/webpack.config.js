'use strict';


module.exports = (env, argv) => {

    const isDevelopment = env.WEBPACK_SERVE
    const isProduction = !isDevelopment

    //Shared modules
    const path = require('path');
    const webpack = require('webpack');
    const PnpWebpackPlugin = require('pnp-webpack-plugin');
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    const ESLintPlugin = require('eslint-webpack-plugin')
    const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
    const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
    const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
    const getClientEnvironment = require('./env');
    const paths = require('./paths');
    const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
    const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');

    //Development modules
    const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
    const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
    const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
    const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
    const fs = require('fs');

    //Production modules
    const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
    const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
    const safePostCssParser = require('postcss-safe-parser');
    const WorkboxWebpackPlugin = require('workbox-webpack-plugin');


    const publicPath = isDevelopment ? '/' : paths.servedPath;
    // `publicUrl` is just like `publicPath`, but we will provide it to our app
    // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
    // Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
    const publicUrl = isDevelopment ? '' : publicPath.slice(0, -1);


    // Source maps are resource heavy and can cause out of memory issue for large source files.
    const useSourceMap = isDevelopment ? false : false;

    console.log('isDevelopment', isDevelopment)
    console.log('useSourceMap', useSourceMap)

    ///Additional Configuration for PRODUCTION
    //---------------------------------------------------------------------------------------------
    // Some apps do not use client-side routing with pushState.
    // For these, "homepage" can be set to "." to enable relative asset paths.
    const shouldUseRelativeAssetPaths = publicPath === './';
    // Some apps do not need the benefits of saving a web request, so not inlining the chunk
    // makes for a smoother build process.
    //const shouldInlineRuntimeChunk = true 
    //---------------------------------------------------------------------------------------------

    // style files regexes
    const cssRegex = /\.css$/;
    const cssModuleRegex = /\.module\.css$/;
    const sassRegex = /\.(scss|sass)$/;
    const sassModuleRegex = /\.module\.(scss|sass)$/;

    const getLocalIdentName = getCSSModuleLocalIdent || 'undefined';

    let styleLoader;
    if (isDevelopment) { styleLoader = require.resolve('style-loader') };
    if (isProduction) {
        styleLoader = {
            loader: MiniCssExtractPlugin.loader,
            options: Object.assign(
                {},
                shouldUseRelativeAssetPaths ? { publicPath: '../../' } : undefined
            ),
        }
    }

    // common function to get style loaders
    const getStyleLoaders = (cssOptions, preProcessor) => {
        // "style" loader turns CSS into JS modules that inject <style> tags.
        // "css" loader resolves paths in CSS and adds assets as dependencies.
        // "postcss" loader applies autoprefixer to our CSS.
        const loaders = [
            styleLoader,
            {
                loader: require.resolve('css-loader'),
                options: cssOptions,
            },
            {
                // Options for PostCSS as we reference these options twice
                // Adds vendor prefixing based on your specified browser support in
                // package.json
                loader: require.resolve('postcss-loader'),
                options: {
                    // Necessary for external CSS imports to work
                    // https://github.com/facebook/create-react-app/issues/2677
                    postcssOptions: {
                        plugins: [
                            require('postcss-flexbugs-fixes'),
                            require('postcss-preset-env')({
                                autoprefixer: {
                                    flexbox: 'no-2009',
                                },
                                stage: 3,
                            }),
                        ]
                    },
                    implementation: require('postcss'),
                },
            },
        ];
        if (preProcessor) {
            loaders.push({
                loader: require.resolve(preProcessor),
                options: {
                    sourceMap: useSourceMap,
                },
            })
        }
        return loaders;
    };



    return {

        mode: isDevelopment ? 'development' : 'production',
        // Don't attempt to continue if there are any errors.
        bail: true,
        // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
        // See the discussion in https://github.com/facebook/create-react-app/issues/343
        devtool: isDevelopment ? 'cheap-module-source-map' : false,
        devServer: isProduction ? {} : {
            allowedHosts: 'auto',
            client: {
                logging: 'none',
                overlay: true,
                progress: true,
            },
            compress: true,
            server: {
                type: 'https',
                options: {
                    key: paths.localHostKey,
                    cert: paths.localHostCert,
                }
            },
            host: "localhost",
            hot: true,
            static: {
                directory: paths.appPublic,
                publicPath: publicPath,
            },
            // Enable HTTPS if the HTTPS environment variable is set to 'true'


            //overlay: false,
            historyApiFallback: {
                // Paths with dots should still use the history fallback.
                // See https://github.com/facebook/create-react-app/issues/387.
                disableDotRule: true,
            },
            open: true,
            port: 60001,
            proxy: {
                '/api': `http://localhost:50001`
            },

            setupMiddlewares: (middlewares, devServer) => {

                if (!devServer) {
                    throw new Error('webpack-dev-server is not defined');
                }

                if (fs.existsSync(paths.proxySetup)) {
                    // This registers user provided middleware for proxy reasons
                    require(paths.proxySetup)(devServer.app);
                }

                // This lets us fetch source contents from webpack for the error overlay
                middlewares.unshift({
                    name: 'eval-source-map',
                    middleware: evalSourceMapMiddleware(devServer),
                })
                // This lets us open files from the runtime error overlay
                middlewares.unshift({
                    name: 'error-overlay',
                    middleware: errorOverlayMiddleware(),
                })
                // This service worker file is effectively a 'no-op' that will reset any
                // previous service worker registered for the same host:port combination.
                // We do this in development to avoid hitting the production cache if
                // it used the same host and port.
                // https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432
                middlewares.unshift({
                    name: 'no-op-service-worker',
                    middleware: noopServiceWorkerMiddleware(),
                })

                return middlewares
            }
        },
        // These are the "entry points" to our application.
        // This means they will be the "root" imports that are included in JS bundle.
        entry: paths.appIndexJs,
        output: {
            // The build folder. (not applicable to development)
            path: isProduction ? paths.appBuild : undefined,
            // Add /* filename */ comments to generated require()s in the output.
            pathinfo: isProduction ? true : false,
            // In production hash is added to bust cache. In development, it is not.
            filename: isProduction ? 'static/js/[name].[chunkhash:8].js' : 'static/js/[name].bundle.js',
            chunkFilename: isProduction ? 'static/js/[name].[chunkhash:8].chunk.js' : 'static/js/[name].chunk.js',
            publicPath,
            // Point sourcemap entries to original disk location (format as URL on Windows)
            devtoolModuleFilenameTemplate: info =>
                path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, '/'),
        },
        optimization: {
            // Automatically split vendor and commons
            splitChunks: {
                chunks: 'all',
                name: false,
            },
            // Keep the runtime chunk seperated to enable long term caching
            runtimeChunk: true,
            //'...' adds in default minimizer as well. Development = false to speed up build time.
            minimizer: isProduction ? [new CssMinimizerPlugin(), '...'] : [false]
        },
        resolve: {
            // This allows you to set a fallback for where Webpack should look for modules.
            // We placed these paths second because we want `node_modules` to "win"
            // if there are any conflicts. This matches Node resolution mechanism.
            // https://github.com/facebook/create-react-app/issues/253
            modules: ['node_modules'].concat(
                // It is guaranteed to exist because we tweak it in `env.js`
                process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
            ),
            extensions: ['.mjs', '.web.js', '.js', '.json', '.web.jsx', '.jsx'],
            alias: {
                // Support React Native Web
                // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
                'react-native': 'react-native-web',
            },
            plugins: [
                // Adds support for installing with Plug'n'Play,
                PnpWebpackPlugin,
                // Prevents users from importing files from outside of src/ (or node_modules/).
                new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
            ],
        },
        resolveLoader: {
            plugins: [
                // Also related to Plug'n'Play, but this time it tells Webpack to load its loaders
                // from the current package.
                PnpWebpackPlugin.moduleLoader(module),
            ],
        },
        module: {
            strictExportPresence: true,
            rules: [
                // Disable require.ensure as it's not a standard language feature.
                //{ parser: { requireEnsure: false } },
                {
                    oneOf: [
                        // "url" loader works like "file" loader except that it embeds assets
                        // smaller than specified limit in bytes as data URLs to avoid requests.
                        // A missing `test` is equivalent to a match.
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: true,
                                name: 'static/media/[name].[ext]',
                            },
                        },
                        // Process application JS with Babel.
                        // The preset includes JSX, Flow, and some ESnext features.
                        {
                            test: /\.(js|mjs|jsx)$/,
                            exclude: /node_modules/,
                            //include: paths.appSrc,
                            loader: require.resolve('babel-loader'),
                            options: {
                                customize: require.resolve(
                                    'babel-preset-react-app/webpack-overrides'
                                ),


                                // This is a feature of `babel-loader` for webpack (not Babel itself).
                                // It enables caching results in ./node_modules/.cache/babel-loader/
                                // directory for faster rebuilds.
                                cacheDirectory: true,
                                // Don't waste time on Gzipping the cache in development
                                cacheCompression: isProduction ? true : false,
                                compact: isProduction ? true : false,
                            },
                        },
                         //Process any JS outside of the app with Babel.
                        //Unlike the application JS, we only compile the standard ES features.
                        {
                            test: /\.(js|mjs)$/,
                            exclude: /@babel(?:\/|\\{1,2})runtime/,
                            loader: require.resolve('babel-loader'),
                            options: {
                                babelrc: false,
                                configFile: false,
                                compact: false,
                                presets: [
                                    [
                                        require.resolve('babel-preset-react-app/dependencies'),
                                        { helpers: true },
                                    ],
                                ],
                                cacheDirectory: true,
                                // Don't waste time on Gzipping the cache
                                cacheCompression: isProduction ? true : false,

                                // If an error happens in a package, it's possible to be
                                // because it was compiled. Thus, we don't want the browser
                                // debugger to show the original code. Instead, the code
                                // being evaluated would be much more helpful.
                                sourceMaps: false,
                            },
                        },


                        {
                            test: cssRegex,
                            exclude: cssModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: useSourceMap,
                            }),
                        },
                        {
                            test: cssModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: useSourceMap,
                                modules: {
                                    getLocalIdent: getLocalIdentName,
                                }
                            }),
                        },
                        // Opt-in support for SASS (using .scss or .sass extensions).
                        // Chains the sass-loader with the css-loader and the style-loader
                        {
                            test: sassRegex,
                            exclude: sassModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 2,
                                sourceMap: useSourceMap,
                            }, 'sass-loader'),
                        },
                        // Adds support for CSS Modules, but using SASS
                        // using the extension .module.scss or .module.sass
                        {
                            test: sassModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 2,
                                    sourceMap: useSourceMap,
                                    modules: {
                                        getLocalIdent: getLocalIdentName
                                    },
                                },
                                'sass-loader'
                            ),
                        },
                        //handle images etc.
                        {
                            test: /\.(ico|png|webp|jpg|gif|jpeg)$/,
                            type: "asset/resource",
                        },
                        //This rule is here to include font awesome deps as separate font
                        {
                            test: /\.(svg|eot|woff|woff2|ttf)$/,
                            type: 'asset/resource',
                            generator: {
                                //publicPath: '../fonts/',
                                filename: 'compiled/fonts/[hash][ext][query]'
                            }
                        },
                        // "file" loader at end to catch all other files.
                        {
                            // Exclude `js` files to keep "css" loader working as it injects
                            // its runtime that would otherwise be processed through "file" loader.
                            // Also exclude `html` and `json` extensions so they get processed
                            // by webpacks internal loaders.
                            exclude: [/\.(js|mjs|jsx)$/, /\.html$/, /\.json$/, /\.bin$/],
                            loader: require.resolve('file-loader'),
                            options: {
                                name: 'static/media/[name].[hash:8].[ext]',
                            },
                        },
                    ],
                },
                // ** STOP ** Are you adding a new loader?
                // Make sure to add the new loader(s) before the "file" loader.
            ],
        },
        plugins: [
            new ESLintPlugin({
                extensions: ['js', 'jsx', 'mjs', 'ts', 'tsx'],
                formatter: require.resolve('react-dev-utils/eslintFormatter'),
            }),
            // Generates an `index.html` file with the <script> injected.
            new HtmlWebpackPlugin({
                inject: true,
                template: paths.appHtml,
                minify: isDevelopment ? {} : {
                    //isProduction:
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true,
                    minifySVG: false,
                },
            }),

            // Makes some environment variables available in index.html.
            // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
            // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
            // In development, this will be an empty string.
            //new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),

            // This gives some necessary context to module not found errors, such as
            // the requesting resource.
            new ModuleNotFoundPlugin(paths.appPath),
            //// Makes some environment variables available to the JS code
            //// Slow in mode: development. Fast in mode: production
            //new webpack.DefinePlugin(env.stringified),
            // Generate a manifest file which contains a mapping of all asset filenames
            // to their corresponding output file so that tools can pick it up without
            // having to parse `index.html`.
            new WebpackManifestPlugin({
                fileName: 'asset-manifest.json',
                publicPath: publicPath,
            }),
            //this can be removed if not using Moment.js
            new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ }),


            //Environment specific plugins

            // Watcher doesn't work well if you mistype casing in a path this plugin prints an error when you attempt to do this.
            // See https://github.com/facebook/create-react-app/issues/240
            isDevelopment &&
            new CaseSensitivePathsPlugin(),

            isProduction &&
            new MiniCssExtractPlugin({
                filename: 'static/css/[name].[contenthash:8].css',
                chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),

            // Generate a service worker script that will precache, and keep up to date,
            // the HTML & assets that are part of the Webpack build.
            isProduction &&
            new WorkboxWebpackPlugin.GenerateSW({
                clientsClaim: true,
                exclude: [/\.map$/, /asset-manifest\.json$/],
                /*            importWorkboxFrom: 'cdn',*/
                navigateFallback: publicUrl + '/index.html',
                navigateFallbackDenylist: [
                    // Exclude URLs starting with /_, as they're likely an API call
                    new RegExp('^/_'),
                    // Exclude URLs containing a dot, as they're likely a resource in
                    // public/ and not a SPA route
                    new RegExp('/[^/]+\\.[^/]+$'),
                ],
            }),

            // Inlines the webpack runtime script. This script is too small to warrant a network request.
            new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime~.+[.]js/]),
        ].filter(Boolean),//allows for isProduction && syntax above

        // Some libraries import Node modules but don't use them in the browser.
        // Tell Webpack to provide empty mocks for them so importing them works.
        node: {
            __dirname: false,  // Enable the use of __dirname in the browser
            __filename: false, // Enable the use of __filename in the browser
            global: true,      // Enable the use of the global object in the browser
        },
        // Turn off performance processing because we utilize
        // our own hints via the FileSizeReporter
        performance: false,
        watchOptions: {
            ignored: /node_modules/,
        },
        stats: 'verbose'
    };
}