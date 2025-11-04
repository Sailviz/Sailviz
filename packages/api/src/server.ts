import express from "express";
import cors from "cors";
import { RPCHandler } from "@orpc/server/node";
import { mainRouter } from "./contract-implement";
import { toNodeHandler } from "better-auth/node";
import * as AuthMod from "@sailviz/auth/auth";
// Be resilient to different export styles (named vs default)
const authAny: any = (AuthMod as any);
const auth = authAny?.auth ?? authAny?.default ?? authAny;
import { RequestHeadersPlugin } from "@orpc/server/plugins";

import { ORIGIN_URL } from "./config";

const app = express();
app.use(
  cors({
    origin: ORIGIN_URL || "http://localhost:5173",
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

app.listen(3000, () => {
  console.log("🚀 oRPC server listening on http://127.0.0.1:3000");
});
