export function createMessageButtonOwnership({ ownedByModule = true } = {}) {
    let ownsButtons = ownedByModule;

    return Object.freeze({
        configure(nextOwnership) {
            ownsButtons = nextOwnership === true;
        },
        ownsButtons() {
            return ownsButtons;
        },
        runOwnedCleanup(cleanup) {
            if (!ownsButtons) return false;
            cleanup();
            return true;
        },
    });
}
