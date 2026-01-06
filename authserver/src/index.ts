import Fastify from "fastify";
import { internalJWKS } from "./jwks";
import { handleGoogleCallback } from "./handleGoogleCallback";

const port = Number(process.env.PORT) || 3002;
const fastify = Fastify();

// JWKS endpoint
fastify.get("/.well-known/jwks.json", async (_, reply) => {
  return reply.code(200).send(internalJWKS);
});

// Google OAuth callback handler
fastify.all("/auth*", handleGoogleCallback);

// Default 404 handler
fastify.setNotFoundHandler((_, reply) => {
  reply.code(404).send("not found");
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`Server running on http://0.0.0.0:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
