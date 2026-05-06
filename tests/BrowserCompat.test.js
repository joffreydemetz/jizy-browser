import { describe, it, expect, beforeEach, vi } from 'vitest';
import BrowserCompat from '../lib/index.js';

const FIREFOX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0';
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const OPERA_MINI_UA = 'Opera/9.80 (J2ME/MIDP; Opera Mini/9.0.1829/191.255; U; en) Presto/2.12.423 Version/12.16';
const IE11_UA = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko';

function setDocumentMode(value) {
    Object.defineProperty(document, 'documentMode', {
        configurable: true,
        get() {
            return value;
        }
    });
}

describe('BrowserCompat construction', () => {
    it('initialises with empty state', () => {
        const bc = new BrowserCompat();
        expect(bc.compatibilityCheckers).toEqual([]);
        expect(bc.error).toBe('');
        expect(bc.caniuseRegex).toBeNull();
        expect(bc.useCanIuseRegex).toBe(false);
        expect(bc.userBrowserIncompatibilityCallback).toBeNull();
    });
});

describe('BrowserCompat.onBadBrowser', () => {
    it('stores a function callback', () => {
        const bc = new BrowserCompat();
        const cb = () => { };
        bc.onBadBrowser(cb);
        expect(bc.userBrowserIncompatibilityCallback).toBe(cb);
    });

    it('ignores non-function values', () => {
        const bc = new BrowserCompat();
        bc.onBadBrowser('not a function');
        bc.onBadBrowser(42);
        bc.onBadBrowser({});
        expect(bc.userBrowserIncompatibilityCallback).toBeNull();
    });

    it('ignores nullish values', () => {
        const bc = new BrowserCompat();
        bc.onBadBrowser(null);
        bc.onBadBrowser(undefined);
        expect(bc.userBrowserIncompatibilityCallback).toBeNull();
    });
});

describe('BrowserCompat.addChecker', () => {
    it('appends checkers in the order they were added', () => {
        const bc = new BrowserCompat();
        const a = () => { };
        const b = () => { };
        bc.addChecker(a);
        bc.addChecker(b);
        expect(bc.compatibilityCheckers).toEqual([a, b]);
    });
});

describe('BrowserCompat.withCanIuse', () => {
    it('enables caniuse matching when given a regex', () => {
        const bc = new BrowserCompat();
        const re = /Chrome\/(\d+)/;
        bc.withCanIuse(re);
        expect(bc.caniuseRegex).toBe(re);
        expect(bc.useCanIuseRegex).toBe(true);
    });

    it('does nothing when given a falsy value', () => {
        const bc = new BrowserCompat();
        bc.withCanIuse(null);
        bc.withCanIuse(undefined);
        bc.withCanIuse('');
        expect(bc.caniuseRegex).toBeNull();
        expect(bc.useCanIuseRegex).toBe(false);
    });
});

describe('BrowserCompat.noIE', () => {
    it('flags IE when document.documentMode is truthy', () => {
        setDocumentMode(11);
        const bc = new BrowserCompat();
        bc.noIE();
        const result = bc.check({ ua: IE11_UA, error: '' });
        expect(result.error).toBe('Cannot use Internet Explorer !');
    });

    it('passes on non-IE browsers', () => {
        setDocumentMode(0);
        const bc = new BrowserCompat();
        bc.noIE();
        const result = bc.check({ ua: FIREFOX_UA, error: '' });
        expect(result.error).toBe('');
    });
});

describe('BrowserCompat.noOperaMini', () => {
    it('flags Opera Mini user agents', () => {
        const bc = new BrowserCompat();
        bc.noOperaMini();
        const result = bc.check({ ua: OPERA_MINI_UA, error: '' });
        expect(result.error).toBe('Cannot use Opera Mini !');
    });

    it('passes on user agents without "Opera Mini"', () => {
        const bc = new BrowserCompat();
        bc.noOperaMini();
        const result = bc.check({ ua: CHROME_UA, error: '' });
        expect(result.error).toBe('');
    });
});

describe('BrowserCompat.isES6', () => {
    it('passes in a modern test environment', () => {
        const bc = new BrowserCompat();
        bc.isES6();
        const result = bc.check({ ua: CHROME_UA, error: '' });
        expect(result.error).toBe('');
    });
});

describe('BrowserCompat.check caniuse handling', () => {
    it('marks the browser usable when the regex matches', () => {
        const bc = new BrowserCompat();
        bc.withCanIuse(/Chrome\/(\d+)/);
        const result = bc.check({ ua: CHROME_UA, error: '' });
        expect(result.canIuse).toBe(true);
        expect(result.canIuseResultClean).toEqual(['120']);
        expect(result.error).toBe('');
    });

    it('rejects when the regex does not match', () => {
        const bc = new BrowserCompat();
        bc.withCanIuse(/ThisBrowserDoesNotExist\/(\d+)/);
        const result = bc.check({ ua: CHROME_UA, error: '' });
        expect(result.canIuse).toBe(false);
        expect(result.error).toBe('Browser is too old');
    });

    it('rejects when match returns only undefined groups', () => {
        const bc = new BrowserCompat();
        bc.withCanIuse(/(Nope)?/);
        const result = bc.check({ ua: CHROME_UA, error: '' });
        expect(result.canIuse).toBe(false);
        expect(result.canIuseResultClean).toBe(false);
        expect(result.error).toBe('Browser is too old');
    });

    it('skips checker pipeline when caniuse fails', () => {
        const bc = new BrowserCompat();
        const checker = vi.fn();
        bc.withCanIuse(/Nope\/(\d+)/);
        bc.addChecker(checker);
        bc.check({ ua: CHROME_UA, error: '' });
        expect(checker).not.toHaveBeenCalled();
    });

    it('does not run the regex when no UA is provided', () => {
        const bc = new BrowserCompat();
        const re = /Chrome\/(\d+)/;
        bc.withCanIuse(re);
        const result = bc.check({ ua: '', error: '' });
        expect(result.error).toBe('');
        expect(result.canIuseResult).toBeUndefined();
    });
});

describe('BrowserCompat.check checker pipeline', () => {
    it('runs every checker in order with the browser argument', () => {
        const bc = new BrowserCompat();
        const calls = [];
        bc.addChecker((b) => { calls.push(['a', b.ua]); });
        bc.addChecker((b) => { calls.push(['b', b.ua]); });
        bc.check({ ua: CHROME_UA, error: '' });
        expect(calls).toEqual([
            ['a', CHROME_UA],
            ['b', CHROME_UA]
        ]);
    });

    it('captures the first thrown error and stops the pipeline', () => {
        const bc = new BrowserCompat();
        const second = vi.fn();
        bc.addChecker(() => { throw new Error('boom'); });
        bc.addChecker(second);
        const result = bc.check({ ua: CHROME_UA, error: '' });
        expect(result.error).toBe('boom');
        expect(second).not.toHaveBeenCalled();
    });
});

describe('BrowserCompat.go', () => {
    beforeEach(() => {
        setDocumentMode(0);
    });

    it('falls back to navigator.userAgent when no ua argument is given', () => {
        const bc = new BrowserCompat();
        const seen = vi.fn();
        bc.addChecker(seen);
        bc.go();
        expect(seen).toHaveBeenCalledTimes(1);
        const browser = seen.mock.calls[0][0];
        expect(browser.ua).toBe(navigator.userAgent);
        expect(typeof browser.doNotTrack).toBe('boolean');
        expect(browser.canIuse).toBe(true);
        expect(browser.error).toBe('');
    });

    it('falls back to navigator.userAgent when given an empty string', () => {
        const bc = new BrowserCompat();
        const seen = vi.fn();
        bc.addChecker(seen);
        bc.go('');
        expect(seen.mock.calls[0][0].ua).toBe(navigator.userAgent);
    });

    it('passes through an explicit ua argument', () => {
        const bc = new BrowserCompat();
        const seen = vi.fn();
        bc.addChecker(seen);
        bc.go(FIREFOX_UA);
        expect(seen.mock.calls[0][0].ua).toBe(FIREFOX_UA);
    });

    it('invokes the user callback when a checker fails', () => {
        const bc = new BrowserCompat();
        const cb = vi.fn();
        bc.onBadBrowser(cb);
        bc.addChecker(() => { throw new Error('nope'); });
        bc.go(CHROME_UA);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb.mock.calls[0][0].error).toBe('nope');
    });

    it('falls back to the default callback when none is registered', () => {
        const bc = new BrowserCompat();
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        bc.addChecker(() => { throw new Error('nope'); });
        bc.go(CHROME_UA);
        expect(errorSpy).toHaveBeenCalled();
        const messages = errorSpy.mock.calls.map((c) => c[0]);
        expect(messages).toContain('Browser is not compatible !');
        expect(messages.some((m) => m.includes(CHROME_UA))).toBe(true);
        expect(messages.some((m) => m.includes('nope'))).toBe(true);
        errorSpy.mockRestore();
    });

    it('does not call any callback when all checkers pass', () => {
        const bc = new BrowserCompat();
        const cb = vi.fn();
        bc.onBadBrowser(cb);
        bc.addChecker(() => { });
        bc.go(CHROME_UA);
        expect(cb).not.toHaveBeenCalled();
    });

    it('reflects IE detection through the full pipeline', () => {
        setDocumentMode(11);
        const bc = new BrowserCompat();
        const cb = vi.fn();
        bc.onBadBrowser(cb);
        bc.noIE();
        bc.go(IE11_UA);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb.mock.calls[0][0]).toMatchObject({
            ua: IE11_UA,
            error: 'Cannot use Internet Explorer !',
            ie: 11
        });
    });
});
