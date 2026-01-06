import { GameSettings } from "src/types/gameTypes";
import { GameClientBase } from "./GameClientBase";
import { State, User } from "./State";
import { i18n } from "../utils/i18n.ts";

// TODO: Replace some things with shared stuff, perhaps physics too?
export class GameClientOnline extends GameClientBase {
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.renderGameMessage(i18n.t("play.online.waiting"), i18n.t("play.online.waitingSub")); // KOBE
  }

  sendReady() {

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "queue-join", payload: { user: State.user } }));
    }
  }

  sendStart() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "online-player-ready" }));
    }
  }

  sendInputs = () => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "online-input",
        payload: {
          input: {
            dt: 1 / this.tickRate,
            up: this.keys.has("a") || this.keys.has("w"),
            down: this.keys.has("d") || this.keys.has("s"),
          },
        }
      }));
    }
  }

  /**
  * @param payload payload from the message, has to be of the same form as in gameserver message schema
  */
  protected onReady(payload: {
    matchId: string, settings: GameSettings,
    players?: {
      player1: { name: string, avatarUrl: string },
      player2: { name: string, avatarUrl: string }
    }
  }) {

    this.matchId = payload.matchId;
    this.match.serverId = payload.matchId;
    this.setSettings(payload.settings);
    this.renderGamePaused();
    this.emit("ready");

    if (payload?.players) {
      this.match.player1 = {
        name: payload.players.player1.name,
        avatarUrl: payload.players.player1.avatarUrl,
        isGuest: true, // TODO
      };
      this.match.player2 = {
        name: payload.players.player2.name,
        avatarUrl: payload.players.player2.avatarUrl,
        isGuest: true,
      };

      // Emit een custom event om UI te updaten
      this.emit("players-updated");
    }
  }

  protected onStarted(payload?: {
    players?: {
      player1: { name: string, avatarUrl: string },
      player2: { name: string, avatarUrl: string }
    }
  }) {

    const tickMs = 1000 / this.tickRate;
    this.interval = setInterval(() => this.sendInputs(), tickMs);
    this._running = true;
    this.emit("started");

  }

  protected onStopped() {
    if (this.interval) clearInterval(this.interval);
    this._running = false;
    this.renderGameMessage(i18n.t("game.stopped"), i18n.t("game.playerLeft"));
    this.emit("stopped");
  }

  protected onPaused() {
    if (this.interval) clearInterval(this.interval);
    this._running = false;
    this.renderGamePaused();
    this.emit("paused");
  }

  protected onOver(reason: string) {
    if (this.interval) clearInterval(this.interval);
    this._running = false;
    this.renderGamePaused();
    this.emit("paused");
  }

  async handleMessage(event: MessageEvent) {
    let text;
    if (event.data instanceof Blob) {
      text = await event.data.text();
    } else {
      text = event.data;
    }

    try {
      const msg = JSON.parse(text);
      switch (msg.type) {
        case "state": {
          this.updateState(msg.payload);
          break;
        }
        case "started": {
          this.onStarted(msg.payload);
          break;
        }
        case "stopped": {
          this.onStopped();
          break;
        }
        case "paused": {
          this.onPaused();
          break;
        }
        case "finished": {
          this.onFinished(msg.payload);
          break;
        }
        case "game-ready": {
          this.onReady(msg.payload);
          break;
        }
        case "game-over": {
          this.onOver(msg.payload);
          break;
        }
        case "online-player-ready": {
          this.renderGameMessage(i18n.t("play.online.ready"), i18n.t("play.online.readySub"));
          break;
        }
        case "auth-success": {
          this.emit("auth-success");
          break;
        }
        case "auth-fail": {
          this.emit("auth-fail");
          break
        }
        case "error": {
          break;
        }
        default:
          throw new Error("Unhandled message type");
      }
    } catch (err) {
      console.log("Failed to parse message:", text, err);
    }
  }
}
