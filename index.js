// Stable public entry. Installations updated from releases before 3.1.8 still start from
// `index.js` through a manifest cached by the browser; forward them to the built plugin.
// Remove this file once no installation older than the dist/host/plugin.js release remains.
import './dist/host/plugin.js';
