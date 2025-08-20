/*! BrowserCompat v@VERSION | @DATE | [@BUNDLE] */
(function (global) {
    "use strict";

    if (typeof global !== "object" || !global || !global.document) {
        throw new Error("BrowserCompat requires a window and a document");
    }

    if (typeof global.BrowserCompat !== "undefined") {
        throw new Error("BrowserCompat is already defined");
    }

    // @CODE 

    global.BrowserCompat = BrowserCompat;

})(typeof window !== "undefined" ? window : this);