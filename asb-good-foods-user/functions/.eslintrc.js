module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "quotes": "off",
    "linebreak-style": 0,
    "max-len": ["error", {"code": 400}],
    "indent": "off",
    "key-spacing" : "off",
    "comma-spacing": "off",
    "no-unused-vars" : "off",
    "no-var" : "off",
    "prefer-const" : "off",
    "no-trailing-spaces" : "off",
    "object-curly-spacing": "off",
    "require-jsdoc" : 0,
    "space-before-blocks": "off",
  },
};
