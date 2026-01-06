import * as WebSocket from "ws";

export interface WSClient extends WebSocket.WebSocket {
  isAlive: boolean;
  interval: NodeJS.Timeout;
}
