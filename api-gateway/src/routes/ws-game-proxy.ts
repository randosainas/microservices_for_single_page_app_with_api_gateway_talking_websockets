import { FastifyInstance, FastifyPluginOptions } from "fastify";
import websocketPlugin from "@fastify/websocket";
import { WebSocket } from "ws";
import { verifyJwt } from "./../middleware/verification/verifyJwt";

export async function WSGameProxy(fastify: FastifyInstance, opts: FastifyPluginOptions) {

  fastify.get("/game", { websocket: true }, (clientWebSocket: WebSocket, req) => {

    const targetUrl = `ws://gameserver:3003/game`;

    // Require first message { type: "auth", token }
    let authed = false;
    const authTimeout = setTimeout(() => {
      if (!authed) {
        clientWebSocket.close(4001, "Auth timeout");
      }
    }, 5000); // 5 seconds to send auth
    // First frame only
    clientWebSocket.once("message", async (msg: WebSocket.RawData) => {
      try {
        const { type, token } = JSON.parse(msg.toString());
        if (type !== "auth" || !token) {
          clientWebSocket.close(4002, "Missing auth token");
          return;
        }
        // Verify Jwt
        const payload = await verifyJwt(token);
        authed = true;
        clearTimeout(authTimeout);
        //Connect to the actual game server
        const gameWebSocket = new WebSocket(targetUrl);
        // When game server connection opens, bridge them
        gameWebSocket.on("open", () => {
          // Forward all future messages after authentication, as strings
          clientWebSocket.on("message", (msg: WebSocket.RawData) => {
            if (clientWebSocket.readyState === WebSocket.OPEN && gameWebSocket.readyState === WebSocket.OPEN) {
              gameWebSocket.send(msg.toString());
            }
          });
          gameWebSocket.on("message", (msg: WebSocket.RawData) => {
            if (clientWebSocket.readyState === WebSocket.OPEN) {
              clientWebSocket.send(msg.toString());
            }
          });
          // Mirror close, ping and pong
          clientWebSocket.on("close", () => gameWebSocket.close());
          gameWebSocket.on("close", () => clientWebSocket.close());
          clientWebSocket.on("ping", () => gameWebSocket.ping());
          gameWebSocket.on("ping", () => clientWebSocket.ping());
          clientWebSocket.on("pong", () => gameWebSocket.pong());
          gameWebSocket.on("pong", () => clientWebSocket.pong());

        });
        gameWebSocket.on("error", (err) => {
          fastify.log.error({ err }, "Game server WS error:");
          clientWebSocket.close(1011, "Game server connection failed");
        });
        // Send message to client that auth was a success
        clientWebSocket.send(JSON.stringify({ type: "auth-success" }));
      }
      catch (err) {
        fastify.log.error({ err }, "JWT verification failed:");
        // Send message to client that auth was a fail
        // NOTE: We could add a reason to this, or make frontend use the reason
        // provided in the ws.close
        clientWebSocket.send(JSON.stringify({ type: "auth-fail" }));
        clientWebSocket.close(4003, "Invalid or malformed token");
      }
    });
  });
}
