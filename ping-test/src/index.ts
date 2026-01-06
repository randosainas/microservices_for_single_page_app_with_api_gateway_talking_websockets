import Fastify from 'fastify';
import FastifyFavicon from 'fastify-favicon';

async function start() {
  const server = Fastify();

  await server.register(FastifyFavicon);

  server.get("/api/v1/test", async () => {
    return { message: "it works! Great!" };
  });

  server.listen({ port: 4000, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    server.log.info(`Backend running on ${address}`);
  });
}

start();
