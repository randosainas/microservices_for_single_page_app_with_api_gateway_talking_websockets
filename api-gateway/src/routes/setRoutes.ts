import { FastifyInstance, FastifyPluginOptions } from "fastify";
import ApiRoutes from "./standardApiRoute";
import { WSGameProxy } from "./ws-game-proxy";

export function setRoutes(fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: Function) {

  fastify.all("/v1/:service", ApiRoutes);
  fastify.all("/v1/:service/:id", ApiRoutes);

  // Let WSGameProxy also add a route "fastyfy.get("/game", ....
  fastify.register(WSGameProxy);

  //TODO (optional): add /health to check. Do this for every microservice.
  //Check in the handler if a response is coming in and send a custom message
  //like "this service is currently down".
  // fastify.get('/v1/users/health', healthOpts);

  done();
}
