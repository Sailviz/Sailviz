import { createServer } from "http";
import { WebSocketServer } from "ws";
import * as config from "./config";
import { call, os } from "@orpc/server";

function hexStringToByteArray(hexString: string) {
  if (!hexString || hexString.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }

  const byteArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return byteArray;
}

function uintToByteArray(value: number): Uint8Array {
  return new Uint8Array([(value >> 8) & 0xff, value & 0xff]);
}
export const generateServer = () => {
  const wsserver = createServer();

  const wss = new WebSocketServer({ server: wsserver });
  console.log(`WebSocket server is running on ${config.WS_URL}`);
  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");

    // Send a welcome message to the client
    ws.send(
      JSON.stringify({ type: "welcome", data: "Connected to WebSocket API!" }),
    );
    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data.toString());
      console.log("Received data:", data);
      if (data.type == "hootRequest") {
        //modify this to request status for specific device
        console.log(`hoot request received: ${data.orgId}, ${data.duration}`);
        // convert deviceId from string to byte array
        const orgId = hexStringToByteArray(data.orgId);
        const duration = uintToByteArray(data.duration);
        if (duration != undefined || data.duration < 1000) {
          // bit of a safety check you know
          //generate byte array with status request and device ID
          const packet = new Uint8Array([0x02, ...duration]);

          console.log("Sending status request:", packet);
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(packet, { binary: true });
            }
          });
        }
      }
    });
  });
  return wsserver;
};
