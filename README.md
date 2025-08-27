# jizy-browser

A simple browser compatibility library to check for feature support.

## Browser Compatibility Layer

This package provides a browser compatibility layer for web projects, including JavaScript logic and stylesheets to detect and block unsupported browsers.

### Structure

- **lib/index.js**: Main entry point. Exports the `BrowserCompat` class.
- **lib/js/browsercompat.js**: Contains the `BrowserCompat` class for browser compatibility checking.
- **lib/less/**: LESS stylesheets for the compatibility UI overlay.
    - `structure.less`, `screen.less`: Layout and appearance.
    - `variables.less`: Color variables.

### Features
- Register custom compatibility checkers.
- Block Internet Explorer and other unsupported browsers.
- Customizable callback for incompatible browsers.
- Optional integration with caniuse.com regexes.
- Prebuilt styles for displaying compatibility warnings.

### Usage Example

```js
import BrowserCompat from 'jizy-browser';

const checker = new BrowserCompat();
checker.onBadBrowser((browser) => {
  // Custom action when browser is not supported
});
checker.noIE(); // Block Internet Explorer
```

### Purpose

- Detect and block unsupported browsers.
- Provide customizable UI and error handling for users on unsupported browsers.
- Include stylesheets for a modern compatibility warning overlay.

