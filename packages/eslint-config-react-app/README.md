# eslint-config-react-app-new

## Requirements

- `Node.js >= 18.20.0`
- `ESLint >= 9.0.0`

## Usage

```js
// eslint.config.js
const { defineConfig } = require('eslint/config');
const reactAppConfig = require('eslint-config-react-app-new');

module.exports = defineConfig({
    extends: [reactAppConfig],

    // Optional: other custom rules can be added here
    rules: {
        // example: override a rule
        'no-console': 'warn'
    }
});
```
