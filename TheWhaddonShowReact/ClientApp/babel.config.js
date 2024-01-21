module.exports = {
  "presets": [
        "react-app",
        '@babel/preset-env',
        '@babel/preset-react'
  ],
  "plugins": [
      ["@babel/plugin-transform-class-properties", { "loose": true }],
      "@babel/plugin-transform-optional-chaining",
      ["@babel/plugin-transform-private-property-in-object", { "loose": true }],
  ]
};