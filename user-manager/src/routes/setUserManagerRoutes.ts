import { FastifyInstance, FastifyPluginOptions } from "fastify";
import getUserOpts from "./getUserOpts";
import setUserOpts from "./setUserOpts";
import delUserOpts from "./delUserOpts";
import getMeOpts from "./getMeOpts";
import patchUserOpts from "./patchUserOpts";

export function setUserManagerRoutes(fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: Function) {

  fastify.get('/users/me', getMeOpts);
  fastify.get('/users/:username', getUserOpts);
  fastify.delete('/users/deleteme', delUserOpts);
  fastify.patch('/users/patchme', patchUserOpts);

  // TODO: Should be made only useable by the authserver
  fastify.post('/users/find-or-create', setUserOpts);

  done();
}
