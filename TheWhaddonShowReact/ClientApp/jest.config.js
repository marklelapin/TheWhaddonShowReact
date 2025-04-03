const config = {

    "collectCoverageFrom": [
        "src/**/*.{js,jsx}"
    ],
    //"moduleFileExtensions": [
    //    "web.js",
    //    "js",
    //    "json",
    //    "web.jsx",
    //    "jsx",
    //    "node"
    //],
    //"moduleNameMapper": {
    //    "^react-native$": "react-native-web",
    //    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy"
    //},
    //"resolver": "jest-pnp-resolver",
    //"setupFiles": [
    //    "react-app-polyfill/jsdom"
    //],
    //"testEnvironment": "jsdom",
    //"testMatch": [
    //    "<rootDir>/src/**/__tests__/**/*.{js,jsx}",
    //    "<rootDir>/src/**/?(*.)(spec|test).{js,jsx}"
    //],
    //"testURL": "http://localhost",
    "transform": {
        "^.+\\.(js|jsx)$": "<rootDir>/node_modules/babel-jest",
        "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
        "^(?!.*\\.(js|jsx|css|json)$)": "<rootDir>/config/jest/fileTransform.js"
    },
    "transformIgnorePatterns": [
        "[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$",
        "^.+\\.module\\.(css|sass|scss)$"
    ]

}

module.exports = config;