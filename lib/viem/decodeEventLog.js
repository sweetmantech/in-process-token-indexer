import { parseEventLogs } from "viem";
import { ABI, EVENT_NAME } from "../const.js";

const decodeEventLog = (event) => {
  let parsedLog;
  try {
    parsedLog = parseEventLogs({
      abi: ABI,
      logs: event.allTxLogs,
      eventName: EVENT_NAME,
    })[0];
    console.log("SWEETS PARSED LOG", parsedLog);
  } catch (parseError) {
    console.error("Error parsing event log:", parseError);
    if (!parsedLog) parsedLog = { eventName: "Unknown", args: {} };
  }
  return parsedLog;
};

export default decodeEventLog;
