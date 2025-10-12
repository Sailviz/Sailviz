import express from "express";
import cors from "cors";
import { RPCHandler } from "@orpc/server/node";
import { mainRouter } from "./contract-implement";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@sailviz/auth/auth";
import { onError, ORPCError } from "@orpc/server";
import z from "zod";
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const mainHandler = new RPCHandler(mainRouter);

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
