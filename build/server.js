"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_fastify = __toESM(require("fastify"));
var import_cookie = __toESM(require("@fastify/cookie"));

// src/database.ts
var import_knex = require("knex");

// src/env/index.ts
var import_dotenv = require("dotenv");
var import_zod = require("zod");
if (process.env.NODE_ENV === "test") {
  (0, import_dotenv.config)({ path: ".env.test" });
} else {
  (0, import_dotenv.config)();
}
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: import_zod.z.string(),
  PORT: import_zod.z.number().default(3333)
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("\u26A0\uFE0F Invalid environment variables", _env.error.format());
  throw new Error("Invalid environment variables");
}
var env = _env.data;

// src/database.ts
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}
var config2 = {
  client: "sqlite3",
  connection: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations"
  }
};
var knex = (0, import_knex.knex)(config2);

// src/routes/transactions.ts
var import_zod2 = require("zod");

// src/middlewares/check-session-id.ts
async function checkSessionId(request, reply) {
  const sessionId = request.cookies.sessionId;
  if (!sessionId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }
}

// src/routes/transactions.ts
async function transactionsRoutes(app2) {
  app2.get("/", { preHandler: [checkSessionId] }, async (request, reply) => {
    const { sessionId } = request.cookies;
    const transactions = await knex("transactions").where("session_id", sessionId).select();
    return reply.status(200).send({ transactions });
  });
  app2.get("/:id", { preHandler: [checkSessionId] }, async (request, reply) => {
    const getTransactionParamsSchema = import_zod2.z.object({
      id: import_zod2.z.string().uuid()
    });
    const { id } = getTransactionParamsSchema.parse(request.params);
    const { sessionId } = request.cookies;
    const transaction = await knex("transactions").select("*").where({
      session_id: sessionId,
      id
    }).first();
    return reply.status(200).send({ transaction });
  });
  app2.get(
    "/summary",
    { preHandler: [checkSessionId] },
    async (request, reply) => {
      const { sessionId } = request.cookies;
      const summary = await knex("transactions").where("session_id", sessionId).sum("amount", { as: "amount" }).first();
      return reply.status(200).send({ summary });
    }
  );
  app2.post("/", async (request, reply) => {
    const createTransactionBodySchema = import_zod2.z.object({
      title: import_zod2.z.string(),
      amount: import_zod2.z.number(),
      type: import_zod2.z.enum(["credit", "debit"])
    });
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );
    let sessionId = request.cookies.sessionId;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7
        // 7 days
      });
    }
    await knex("transactions").insert({
      id: crypto.randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId
    });
    return reply.status(201).send();
  });
}

// src/app.ts
var app = (0, import_fastify.default)();
app.register(import_cookie.default);
app.register(transactionsRoutes, {
  prefix: "/transactions"
});

// src/server.ts
app.listen({
  port: env.PORT
}).then(() => {
  console.log("\u{1F525} HTTP Server running on port 3333");
});
