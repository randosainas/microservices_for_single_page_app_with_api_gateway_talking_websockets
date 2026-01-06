import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import { GameManager } from "./game/gameManager.ts";
import fastifyJwt, { JWT } from '@fastify/jwt';

const gameManager = new GameManager();

async function app(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  await fastify.register(fastifyWebsocket);

  // TODO: verify token, perhaps in this preValidation hook, but maybe there's another better way?
  // @fastify/jwt seems to have something, but I don't really know to it works yet.
  //
  // fastify.register(fastifyJwt, {
  //   secret: 'supersecret'
  // });
  //
  // fastify.addHook("onRequest", async (req, repl) => {
  //   try {
  //     await req.jwtVerify();
  //   } catch (err) {
  //     repl.send(err);
  //   }
  // });
  //
  // fastify.addHook('preValidation', async (req, repl) => {
  //   console.log(req.headers);
  // })

  fastify.server.on("error", (err) => {
    console.error(`Fastify server error: ${err}`);
  })

  fastify.get('/game', { websocket: true }, (ws, req) => {

    ws.on("error", (err) => {
      console.error("Socket/Client error:", err);
      ws.close(1011, "Unexpected error");
    });
    ws.on("close", (code, reason) => {
      console.log("Socket closed with code:", code);
    })
    gameManager.handleConnection(ws);
  });
}

export default app;
