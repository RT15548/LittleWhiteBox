function t(){return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)),r=>r.toString(16).padStart(2,"0")).join("")}export{t};
