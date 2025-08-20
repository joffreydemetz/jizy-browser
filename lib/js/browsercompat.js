export default class BrowserCompat {
    static compatibilityCheckers = [];
    static error = '';
    static caniuseRegex = null;
    static useCanIuseRegex = false;
    static userBrowserIncompatibilityCallback = null;

    static defaultBrowserIncompatibilityCallback = (browser) => {
        console.error('Browser is not compatible !');
        console.error('Please use a more recent browser or update your current one.');

        if (browser.ua) {
            console.error('User Agent: ' + browser.ua);
        }

        if (browser.error) {
            console.error('Error: ' + browser.error);
        }
    };

    static onBadBrowser(callback) {
        if (callback && typeof callback === 'function') {
            this.userBrowserIncompatibilityCallback = callback;
        }
    }

    static addChecker(checker) {
        this.compatibilityCheckers.push(checker);
    }

    static withCanIuse(caniuseRegex) {
        if (caniuseRegex) {
            this.caniuseRegex = caniuseRegex;
            this.useCanIuseRegex = true;
        }
    }

    static noIE() {
        this.addChecker(() => {
            if (typeof document !== "undefined" && document.documentMode) {
                throw new Error('Cannot use Internet Explorer !');
            }
        });
    }

    static noOperaMini() {
        this.addChecker((browser) => {
            if (browser.ua.indexOf('Opera Mini') > -1) {
                throw new Error('Cannot use Opera Mini !');
            }
        });
    }

    static isES6() {
        this.addChecker((browser) => {
            function isES6() {
                try {
                    new Function('let x = 1');
                    new Function('const x = `1`');
                    new Function('class X {}');
                    new Function('const x = (a = 0, ...b) => a');
                    new Function('const x = {...Object}');
                    new Function('const y = 1; const x = {y}');
                } catch (e) {
                    return false;
                }

                return true;
            }

            if (!isES6()) {
                throw new Error('Not ES6 compliant');
            }
        });
    }

    static go(ua) {
        let browser = {};
        browser.ua = ua || '';
        browser.doNotTrack = false;
        browser.canIuse = true;
        browser.error = '';
        browser.ie = (typeof document !== "undefined" && document.documentMode) || 0;

        if (typeof navigator !== "undefined") {
            if ('' === ua) {
                browser.ua = navigator.userAgent;
            }
            browser.doNotTrack = "1" === navigator.doNotTrack;
        }

        browser = this.check(browser);

        if ('' !== browser.error) {
            if (this.userBrowserIncompatibilityCallback && typeof this.userBrowserIncompatibilityCallback === 'function') {
                this.userBrowserIncompatibilityCallback(browser);
            } else {
                this.defaultBrowserIncompatibilityCallback(browser);
            }
        }
    }

    static check(browser) {
        if (true === this.useCanIuseRegex && this.caniuseRegex && browser.ua) {
            function checkCanIuseResult(m) {
                if (!m) {
                    return false;
                }

                const result = [];
                for (let i = 1, n = m.length; i < n; i++) {
                    if (undefined === m[i] || !m[i]) {
                        continue;
                    }
                    result.push(m[i]);
                }

                return result.length > 0 ? result : false;
            }

            browser.canIuseResult = browser.ua.match(this.caniuseRegex);
            browser.canIuseResultClean = checkCanIuseResult(browser.canIuseResult);
            browser.canIuse = false !== browser.canIuseResultClean;

            if (false === browser.canIuse) {
                browser.error = 'Browser is too old';
                return browser;
            }
        }

        try {
            for (let i = 0, n = this.compatibilityCheckers.length; i < n; i++) {
                this.compatibilityCheckers[i].apply(this, [browser]);
            }
        } catch (e) {
            browser.error = e.message;
        }

        return browser;
    }
};