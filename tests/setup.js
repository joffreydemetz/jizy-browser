import { beforeEach, afterEach } from 'vitest';

let documentModeDescriptor;
let documentModeWasOwn;

beforeEach(() => {
    documentModeWasOwn = Object.prototype.hasOwnProperty.call(document, 'documentMode');
    documentModeDescriptor = documentModeWasOwn
        ? Object.getOwnPropertyDescriptor(document, 'documentMode')
        : undefined;
});

afterEach(() => {
    if (documentModeWasOwn) {
        Object.defineProperty(document, 'documentMode', documentModeDescriptor);
    } else if (Object.prototype.hasOwnProperty.call(document, 'documentMode')) {
        delete document.documentMode;
    }
});
