module.exports = {
   parser: 'babel-eslint',
   extends: 'eslint:recommended',
   env: {
      browser: true,
      node: true
   },
   rules: {
      semi: 2,
      strict: 0,
      'no-unused-vars': ["error", { "varsIgnorePattern": "MStepper" }]
   }
}
