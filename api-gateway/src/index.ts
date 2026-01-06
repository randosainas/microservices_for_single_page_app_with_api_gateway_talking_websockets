import Fastify from 'fastify';
import Cors from '@fastify/cors';
import websocket from "@fastify/websocket";
import { setRoutes } from "./routes/setRoutes"
import { verificationHook } from './middleware/verification/verificationHook';

const fastifyServer = Fastify();

fastifyServer.register(Cors, {
  origin: true
});

class Gateway {
  constructor(port: number, ipAddr: string) {
    this.port = port;
    this.host = ipAddr;
  };
  port: number;
  host: string;
};

const gateway = new Gateway(3000, "::");
// Registering web socket prior routes, so the websocket wss would not go to routes
fastifyServer.register(websocket);
fastifyServer.register(setRoutes, { prefix: "/api" });

// fastifyServer.addHook("onRequest", async (request, response) => {
//   console.log("Request received: " + `${request.method}`
//     + " " + `${request.url}`);
// });

fastifyServer.addHook("preHandler", async (request, response) => {
  if (request.url === '/api/game') {
    console.log("PreHook exception");
    return;
  }
  await verificationHook(request, response);
});

// fastifyServer.addHook("onResponse", async (request, response) => {
//   console.log("Sending response");
// });

fastifyServer.listen(gateway, (err, address) => {
  if (err) {
    console.error(err);
    console.error("preHook error??");
    process.exit(1);//TODO: is it a good idea to just exit?
  }
  console.log(`fastifyServer listening at ${address}`);
})
