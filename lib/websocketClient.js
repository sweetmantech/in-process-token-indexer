import { createPublicClient, webSocket } from "viem";
import { RPC_URLS } from "./rpc.js";
import { ABI, EVENT_NAME } from "./const.js";

const clients = {};

export function getWebSocketClient(network) {
  if (clients[network]) {
    return clients[network];
  }

  const wsUrl = RPC_URLS[network].ws;
  if (!wsUrl) {
    throw new Error(`WebSocket URL not defined for network: ${network}`);
  }

  const transport = webSocket(wsUrl);
  const client = createPublicClient({
    transport,
  });

  clients[network] = client;
  return client;
}

export async function subscribeToEvents(network, callback) {
  const client = getWebSocketClient(network);

  try {
    const unwatch = await client.watchContractEvent({
      abi: ABI,
      eventName: EVENT_NAME,
      onLogs: (logs) => {
        callback(logs);
      },
    });

    console.log(
      `Subscribed to ${EVENT_NAME} events on ${network} via WebSocket.`
    );
    return unwatch; // Return the unwatch function for later use if needed
  } catch (error) {
    console.error(`Failed to subscribe to events on ${network}:`, error);
  }
}
