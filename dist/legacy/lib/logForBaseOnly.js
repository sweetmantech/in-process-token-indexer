// Helper function to log only for base network (not baseSepolia)
export const logForBaseOnly = (network, ...args) => {
    if (network === 'base') {
        console.log(...args);
    }
};
//# sourceMappingURL=logForBaseOnly.js.map