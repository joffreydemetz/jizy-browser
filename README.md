# jizy-browser

A simple browser compatibility library: register feature checks, run them against the current user
agent, and react when the browser is not supported. Ships the styles of a full-screen "unsupported
browser" overlay.

## Install

```
npm i jizy-browser
```

| Entry | What |
|---|---|
| `lib/index.js` | ESM entry, default export `BrowserCompat` |
| `dist/js/jizy-browser.min.js` | Browser bundle, sets the global `window.BrowserCompat` |
| `dist/css/jizy-browser.min.css` | Overlay styles (`#browser`) |

## Usage

```js
import BrowserCompat from 'jizy-browser';

const compat = new BrowserCompat();
compat.noIE();
compat.isES6();
compat.addChecker((browser) => {
    if (typeof window.FormData === 'undefined') {
        throw new Error('FormData is required');
    }
});
compat.onBadBrowser((browser) => {
    document.body.classList.add('incompatible-browser');
    document.querySelector('#browser .browser-error').textContent = browser.error;
});
compat.go();
```

With the browser bundle, use the global the same way: `new BrowserCompat()`.

## API

| Method | Description |
|---|---|
| `addChecker(fn)` | Registers a check. `fn(browser)` throws an `Error` to fail; its message becomes `browser.error`. Checks run in order and stop at the first failure. |
| `noIE()` | Fails on Internet Explorer (`document.documentMode`). |
| `noOperaMini()` | Fails when the user agent contains `Opera Mini`. |
| `isES6()` | Fails when the engine cannot parse ES2015+ syntax (`let`/`const`, template literals, classes, default/rest parameters, object spread, shorthand properties). |
| `withCanIuse(regex)` | Tests the user agent against a supported-browsers regex first (for example one generated from a browserslist query). The browser passes when at least one capture group matches; otherwise `browser.error` is `Browser is too old` and the other checks are skipped. |
| `onBadBrowser(fn)` | Callback run with the `browser` object when a check fails. Without one, the failure is logged with `console.error`. |
| `go(ua?)` | Runs the checks, against `ua` or `navigator.userAgent`, and calls the bad-browser callback on failure. |
| `check(browser)` | Runs the checks on a prepared `browser` object and returns it (used by `go()`). |

The methods do not return the instance, so they do not chain.

The `browser` object holds `ua`, `ie` (`document.documentMode` or `0`), `doNotTrack`, `canIuse`,
`error` (empty when every check passed) and, with `withCanIuse()`, `canIuseResult` /
`canIuseResultClean`.

## Overlay styles

The CSS styles a `#browser` element that stays hidden until the body gets the
`incompatible-browser` class (which also locks page scrolling). The bad-browser callback is
expected to add that class.

```html
<div id="browser">
    <div>
        <div>
            <div class="browsercheck-logo"></div>
            <h3>Your browser is not supported</h3>
            <p class="browser-error"></p>
        </div>
    </div>
</div>
```

The roomier layout applies through a container query on `#browser` (`min-width: 768px`), and the
overlay is hidden when printing. Theme it by overriding these custom properties at `:root`, in a
stylesheet loaded after this one:

| Variable | Default |
|---|---|
| `--jizy-browser-bg-color` | `rgba(0, 0, 0, .8)` (backdrop) |
| `--jizy-browser-bg2-color` | `#fff` (panel) |
| `--jizy-browser-fg-color` | `#222` |
| `--jizy-browser-bg-error-color` | `#991415` (`.browser-error`) |
| `--jizy-browser-fg-error-color` | `#fff` |

## Structure

- `lib/js/browsercompat.js` — the `BrowserCompat` class.
- `lib/browsercompat.less` — the CSS build entry.
- `lib/less/theme.less` (the custom properties), `structure.less`, `screen.less`.

## Build and test

```
npm run jpack:dist      # rebuild dist/ from lib/ (dist/ is committed)
npm test                # vitest (happy-dom)
npm run test:watch
npm run test:coverage
```

## License

MIT — see [LICENSE](LICENSE).
