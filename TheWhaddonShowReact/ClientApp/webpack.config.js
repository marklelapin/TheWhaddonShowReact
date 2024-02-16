'use strict';

module.exports = (env, argv) => {

    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = !isDevelopment
    console.log('Environment:', process.env.NODE_ENV)
    console.log('webpackmode:', argv.mode)


    //Shared modules
    const path = require('path');
    const paths = require('./config/paths');
    const webpack = require('webpack');
    const HtmlPlugin = require('html-webpack-plugin');
    const PnpPlugin = require('pnp-webpack-plugin');
    const ESLintPlugin = require('eslint-webpack-plugin')
    const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    const CopyPlugin = require('copy-webpack-plugin');
    const WorkboxPlugin = require('workbox-webpack-plugin');

    const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');



    // Source maps are resource heavy and can cause out of memory issue for large source files.
    const useSourceMap = isDevelopment ? false : false;

    const publicPath = '/';


    console.log('isDevelopment', isDevelopment)
    /*    console.log('isDevelopmentBuild', isDevelopmentBuild)*/
    console.log('useSourceMap', useSourceMap)




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
                // shouldUseRelativeAssetPaths ? { publicPath: '../../' } : undefined
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
        bail: true,
        context: __dirname,
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            // In production hash is added to bust cache. In development, it is not.
            filename: isProduction ? 'static/js/[name].[chunkhash:8].js' : 'static/js/[name].bundle.js',
            chunkFilename: isProduction ? 'static/js/[name].[chunkhash:8].chunk.js' : 'static/js/[name].chunk.js',
            publicPath
        },
        devServer: {
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
            historyApiFallback: true,
            open: true,
            port: 60001,
            proxy: {
                '/api': `http://localhost:50001`
            },
        },
        resolve: {
            plugins: [
                // Adds support for installing with Plug'n'Play,
                PnpPlugin,
                // Prevents users from importing files from outside of src/ (or node_modules/).
                new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
            ],
        },
        module: {
            rules: [
                {
                    oneOf: [
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: 'url-loader',
                            options: {
                                limit: true,
                                name: 'static/media/[name].[ext]',
                            },
                        },
                        {
                            test: /\.(js|jsx)$/,
                            //exclude: /node_modules/,
                            include: paths.appSrc,
                            loader: require.resolve('babel-loader'),
                            options: {
                                presets: ['@babel/preset-env', '@babel/preset-react']
                            }

                        },
                        {
                            test: /\.(js|mjs)$/,
                            exclude: /@babel(?:\/|\\{1,2})runtime/,
                            loader: require.resolve('babel-loader'),
                            options: {
                                //babelrc: false,
                                //configFile: false,
                                //compact: false,
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
                        {
                            test: sassRegex,
                            exclude: sassModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 2,
                                sourceMap: useSourceMap,
                            }, 'sass-loader'),
                        },
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
                        //Images
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
                        //{
                        //    exclude: [/\.(js|jsx)$/, /\.html$/, /\.json$/, /\.bin$/],
                        //    loader: require.resolve('file-loader'),
                        //    options: {
                        //        name: 'static/other/[name].[hash:8].[ext]',
                        //    },
                        //},
                    ],
                },
            ]
        },
        plugins: [
            new HtmlPlugin({ template: paths.appHtml, }),
            new ESLintPlugin(),
            new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ }),
            isProduction &&
            new MiniCssExtractPlugin({
                filename: 'static/css/[name].[contenthash:8].css',
                chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) || 'development',
                'process.env.IS_LOCAL_HOST': JSON.stringify(process.env.IS_LOCAL_HOST) || 'false',
                'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL) || '',
            }),
            new CopyPlugin({

                patterns: [
                    { from: './public/android-chrome-192x192.png', to: '' },
                    { from: './public/android-chrome-512x512.png', to: '' },
                    { from: './public/apple-touch-icon.png', to: '' },
                    { from: './public/favicon.png', to: '' },
                    { from: './public/manifest.json', to: '' },
                    { from: './public/offline.html', to: ''}
                ],
            }),
            isProduction &&
            new WorkboxPlugin.InjectManifest({
                swSrc: './src/serviceWorker.js',
                swDest: 'sw.js',
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
            })

        ].filter(Boolean)
    }

};
