import { GameBase } from "./GameBase.ts";
import { RawData } from "ws";
import { getClientMessageData } from "../schemas/messageUtils.ts";
import { GameSettings, schemaServerError, schemaServerGameFinished, schemaServerGamePaused, schemaServerGameStarted, schemaServerGameStopped, schemaServerState } from "../schemas/messageSchemas.ts";
import { WSClient } from "../types/WSClient.ts";

/**
 * GameLocal class
 *
 * Used for games that are played on the same keyboard and require only one websocket connection.
 */
export class GameLocal extends GameBase {
  id = crypto.randomUUID();

  constructor(private ws: WSClient, settings: GameSettings) {
    super(settings);

    ws.on("message", (raw) => this.handleMessage(ws, raw));
    ws.on("close", () => this.handleDisconnect(ws));
    this.broadcastState();
  }

  protected broadcastState() {
    if (this.ws.readyState === this.ws.OPEN) {
      try {
        this.ws.send(JSON.stringify(schemaServerState.parse({ type: "state", payload: this.physics.getState() })));
      } catch (error) {
        this.ws.send(JSON.stringify(schemaServerError.parse({ type: "error", payload: { message: "Bad schema server-side" } })));
      }
    }
  }

  private handleMessage(ws: WSClient, raw: RawData) {
    const msg = getClientMessageData(ws, raw);
    if (!msg)
      return;

    switch (msg.type) {
      case "local1v1-start":
        this.start();
        break;
      case "local1v1-stop":
        this.stop();
        break;
      case "local1v1-pause":
        this.pause();
        break;
      case "local1v1-input":
        this.enqueueInput("p1", msg.payload.p1);
        this.enqueueInput("p2", msg.payload.p2);
        break;
      default: break;
    }
  }

  protected handleStart() {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify(schemaServerGameStarted.parse({ type: "started" })));
    }
  }

  protected handleStopped() {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify(schemaServerGameStopped.parse({ type: "stopped" })));
    }
    // this.cleanup();
  }

  protected handlePaused() {
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify(schemaServerGamePaused.parse({ type: "paused" })));
    }
  }

  protected handleFinished() {
    if (this.ws.readyState === this.ws.OPEN) {
      try {
        this.ws.send(JSON.stringify(schemaServerGameFinished.parse({ type: "finished", payload: this.physics.getWinner() })));
      } catch (error) {
        this.ws.send(JSON.stringify(schemaServerError.parse({ type: "error", payload: { message: "Bad schema server-side" } })));
      }
    }
    // this.cleanup();
  }

  private handleDisconnect(ws: WSClient) {
    this.stop();
    this.cleanup();
  }

  cleanup() {
    if (this.ws.OPEN)
      this.ws.close();
  }
}
