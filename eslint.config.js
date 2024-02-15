// import antfu from '@antfu/eslint-config'

const antfu = require("@antfu/eslint-config").default

module.exports = antfu(
  {
    typescript: true,
  },
  {},
  {
    // Without `files`, they are general rules for all files
    rules: {
      'no-console': 'off',
    },
  },
)
