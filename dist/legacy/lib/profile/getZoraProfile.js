"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function getZoraProfile(address) {
    if (!address)
        return null;
    const response = await fetch(`https://zora.co/api/trpc/profile.getProfile?input={"json":"${address}"}`);
    if (!response.ok)
        return null;
    const data = (await response.json());
    return data.result?.data?.json || null;
}
exports.default = getZoraProfile;
