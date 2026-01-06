import { RawData } from "ws";
import { GameBase } from "./GameBase.ts";
import { WSClient } from "../types/WSClient.ts";
import { getClientMessageData } from "../schemas/messageUtils.ts";
import { PlayerSide } from "../schemas/messageSchemas.ts";
import {
  GameSettings,
  schemaServerError,
  schemaServerGameFinished,
  schemaServerGamePaused,
  schemaServerGameStarted,
  schemaServerGameStopped,
  schemaServerState
} from "../schemas/messageSchemas.ts";

/**
 * GameOnline class
 *
 * Used for games between two remote players, meaning one websocket per player.
 *
 * NOTE: Currently under construction and not tested, A lot is not implemented here.
 * TODO: Create handle... Functions defined in GameBase class
 * TODO: Correctly Define and handle message schemas
 *
 */
export class GameOnline extends GameBase {
  id = crypto.randomUUID();

  private p1: WSClient;
  private p2: WSClient;
  private playersReady: { p1: boolean, p2: boolean } = { p1: false, p2: false };

  private startTime?: number;
  private endTime?: number;

  constructor(p1: WSClient, p2: WSClient) {
    super();
    this.p1 = p1;
    this.p2 = p2;

    p1.on("message", (raw) => this.handleMessage("p1", p1, raw));
    p2.on("message", (raw) => this.handleMessage("p2", p2, raw));

    p1.on('close', () => this.handleDisconnect(p1));
    p2.on('close', () => this.handleDisconnect(p2));

  }

  protected broadcastState() {
    const msg = JSON.stringify(schemaServerState.parse({ type: "state", payload: this.physics.getState() }));
    if (this.p1.readyState === this.p1.OPEN) this.p1.send(msg);
    if (this.p2.readyState === this.p2.OPEN) this.p2.send(msg);
  }

  private handleMessage(side: PlayerSide, ws: WSClient, raw: RawData) {
    const msg = getClientMessageData(ws, raw);
    if (!msg)
      return;

    switch (msg.type) {
      case "online-input":
        this.enqueueInput(side, msg.payload.input);
        break;
      case "online-player-ready":
        this.handlePlayerReady(side, ws);
        break;
      default:
        break;
    }
  }

  protected handlePlayerReady(side: PlayerSide, ws: WSClient) {
    this.playersReady[side] = true;
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "online-player-ready" }));
    }

    if (this.playersReady.p1 === true && this.playersReady.p2 === true) {
      this.start();
      this.startTime = Date.now();
    }
  }

  protected handleStart() {
    if (this.p1.readyState === this.p1.OPEN) {
      this.p1.send(JSON.stringify(schemaServerGameStarted.parse({ type: "started" })));
    }
    if (this.p2.readyState === this.p2.OPEN) {
      this.p2.send(JSON.stringify(schemaServerGameStarted.parse({ type: "started" })));
    }
  }

  protected handleStopped() {
    if (this.p1.readyState === this.p1.OPEN) {
      this.p1.send(JSON.stringify(schemaServerGameStopped.parse({ type: "stopped" })));
    }
    if (this.p2.readyState === this.p2.OPEN) {
      this.p2.send(JSON.stringify(schemaServerGameStopped.parse({ type: "stopped" })));
    }
    // this.cleanup();
  }

  protected handlePaused() {
    if (this.p1.readyState === this.p1.OPEN) {
      this.p1.send(JSON.stringify(schemaServerGamePaused.parse({ type: "paused" })));
    }
    if (this.p2.readyState === this.p2.OPEN) {
      this.p2.send(JSON.stringify(schemaServerGamePaused.parse({ type: "paused" })));
    }
  }

  protected handleFinished() {
    if (this.p1.readyState === this.p1.OPEN) {
      try {
        this.p1.send(JSON.stringify(schemaServerGameFinished.parse({ type: "finished", payload: this.physics.getWinner() })));
      } catch (error) {
        this.p1.send(JSON.stringify(schemaServerError.parse({ type: "error", payload: { message: "Bad schema server-side" } })));
      }
    }
    if (this.p2.readyState === this.p2.OPEN) {
      try {
        this.p2.send(JSON.stringify(schemaServerGameFinished.parse({ type: "finished", payload: this.physics.getWinner() })));
      } catch (error) {
        this.p2.send(JSON.stringify(schemaServerError.parse({ type: "error", payload: { message: "Bad schema server-side" } })));
      }
    }
    this.endTime = Date.now();
    // this.cleanup();
  }

  private handleDisconnect(ws: WSClient) {
    this.stop();
    if (this.p1.readyState === this.p1.OPEN) {
      this.p1.send(JSON.stringify({ type: "game-over", reason: "opponent-disconnected" }));
    }
    if (this.p2.readyState === this.p2.OPEN) {
      this.p2.send(JSON.stringify({ type: "game-over", reason: "opponent-disconnected" }));
    }
    this.cleanup();
  }

  cleanup() {
    if (this.p1.OPEN) this.p1.close();
    if (this.p2.OPEN) this.p2.close();
  }

  public getScore() {
    return this.physics.getState().p1.score + "-" + this.physics.getState().p2.score;
  }

  public getPlayTime() {
    return this.startTime && this.endTime ? (this.endTime - this.startTime) / 1000 : 0;
  }

  public player1Won() {
    return this.physics.getWinner() === "p1";
  }
}
