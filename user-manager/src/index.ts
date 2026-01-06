import Fastify from 'fastify';
import { setUserManagerRoutes } from './routes/setUserManagerRoutes';
import userSchema from './schemas/userSchema';

const fastifyServer = Fastify();

fastifyServer.addSchema(userSchema);
fastifyServer.register(setUserManagerRoutes, { prefix: "/api/v1/" });

// fastifyServer.addHook("onRequest", async (request, response) => {
//   console.log("Request received: " + `${request.method}`
//     + " " + `${request.url}`);
// });
//
// fastifyServer.addHook("onResponse", async (request, response) => {
//   console.log("Sending response");
// });
//
fastifyServer.listen({ port: 4001, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1); //TODO: is it a good idea to just exit?
  }
  console.log("The api endpoints of the user-manager are up and running.");
})
