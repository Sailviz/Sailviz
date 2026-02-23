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
    });
  });
  return wsserver;
};
