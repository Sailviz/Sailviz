import express from "express";
import cors from "cors";
import { RPCHandler } from "@orpc/server/node";
import { mainRouter } from "./contract-implement";
import { toNodeHandler } from "better-auth/node";
import { RequestHeadersPlugin } from "@orpc/server/plugins";

import { ORIGIN_URL } from "./config";
import { auth } from "@sailviz/auth/auth";

const app = express();
app.use(
  cors({
    origin: ORIGIN_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
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
    context: { headers: req.headers },
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
