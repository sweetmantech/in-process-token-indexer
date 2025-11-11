import getSale from '../viem/getSale.js';
import { base, baseSepolia } from 'viem/chains';
import { logForBaseOnly } from '../logForBaseOnly.js';

/**
 * Fetches sales for an array of moments
 * @param {string} network - The network name (for logging purposes)
 * @param {Array<Object>} moments - Array of moment objects with address, tokenId, and chainId
 * @returns {Promise<Array<Object>>} - Array of objects with { moment, sale } where sale may be null if fetch failed
 */
export async function getSalesForMoments(network, moments) {
  const salePromises = moments.map(async moment => {
    try {
      // Determine network from moment's chainId
      const chainId = moment.chainId;
      const networkName =
        chainId === base.id
          ? 'base'
          : chainId === baseSepolia.id
            ? 'baseSepolia'
            : 'base'; // default fallback

      const sale = await getSale(moment.address, moment.tokenId, networkName);
      return { moment, sale };
    } catch (error) {
      logForBaseOnly(
        network,
        `${network} - Error fetching sale for ${moment.address}: ${error.message}`
      );
      return { moment, sale: null };
    }
  });

  const momentsWithSales = await Promise.all(salePromises);
  return momentsWithSales;
}

