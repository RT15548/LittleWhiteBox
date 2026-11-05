'use strict';

// Browser and signed runtime share this transport envelope. The installed host
// already forwards this path; provider operations must not add host routes.
module.exports = Object.freeze({
    path: '/v2/generate-image',
    encodeVibeOperation: 'encode-vibe',
});
