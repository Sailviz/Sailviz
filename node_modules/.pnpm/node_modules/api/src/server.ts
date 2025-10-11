import express from "express";
import cors from "cors";
import { RPCHandler } from "@orpc/server/node";
import { router } from "./contract-implement";

const app = express();

app.use(cors());
// parse JSON bodies (oRPC may expect JSON payloads)
app.use(express.json());

const handler = new RPCHandler(router);

// use a catch-all to let the RPC handler inspect all requests
app.all("{/*path}", async (req, res, next) => {
  const { matched } = await handler.handle(req, res, {
    context: {},
  });

  if (matched) {
    return;
  }

  next();
});

app.listen(3000, () => {
  console.log("🚀 oRPC server listening on http://127.0.0.1:3000");
});
