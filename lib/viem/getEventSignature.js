import { encodeEventTopics, getAbiItem } from "viem";
import { ABI, EVENT_NAME } from "../const.js";

const getEventSignature = () => {
  const event = getAbiItem({
    abi: ABI,
    name: EVENT_NAME,
  });
  return event
    ? encodeEventTopics({
        abi: [event],
        eventName: EVENT_NAME,
      })[0]
    : undefined;
};

export default getEventSignature;
