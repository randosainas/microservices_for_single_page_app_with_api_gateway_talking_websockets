import { GameSettings } from "src/types/gameTypes";
import { GameClientBase } from "./GameClientBase";

// TODO: Replace some things with shared stuff, perhaps physics too?
export class GameClientLocal extends GameClientBase {
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  sendReady() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "local1v1", payload: { settings: this.settings } }));
    }
  }

  sendStart() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "local1v1-start" }));
    }
  }

  sendStop() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "local1v1-stop" }));
    }
  }

  sendPause() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "local1v1-pause" }));
    }
  }

  sendInputs = () => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "local1v1-input",
        payload: {
          p1: {
            dt: 1 / this.tickRate,
            up: this.keys.has("a") || this.keys.has("w"),
            down: this.keys.has("d") || this.keys.has("s"),
          },
          p2: {
            dt: 1 / this.tickRate,
            up: this.keys.has("ArrowRight") || this.keys.has("ArrowUp"),
            down: this.keys.has("ArrowLeft") || this.keys.has("ArrowDown"),
          }
        }
      }));
    }
  }

  /**
  * @param payload payload from the message, has to be of the same form as in gameserver message schema
  */
  protected onReady(payload: { matchId: string, settings: GameSettings }) {
    this.matchId = payload.matchId;
    this.match.serverId = payload.matchId;
    this.setSettings(payload.settings);
    this.renderGamePaused();
    this.emit("ready");
  }

  protected onStarted() {
    const tickMs = 1000 / this.tickRate;
    this.interval = setInterval(() => this.sendInputs(), tickMs);
    this._running = true;
    this.emit("started");
  }

  protected onStopped() {
    if (this.interval) clearInterval(this.interval);
    this._running = false;
    this.emit("stopped");
  }

  protected onPaused() {
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
          this.onStarted();
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
