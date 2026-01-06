import { Emitter } from "./Emitter";
import { User } from "./State";
import { emptyMatch, Match } from "./Tournament";
import { GameSettings, GameState } from "src/types/gameTypes";
import { i18n } from "../utils/i18n.ts";

// TODO: Replace some things with shared stuff, perhaps physics too?
export class GameClientBase extends Emitter {
  protected settings: GameSettings;
  protected state: GameState;
  protected tickRate = 60;
  protected interval: ReturnType<typeof setInterval> | null = null;
  protected pingInterval: ReturnType<typeof setInterval> | null = null;
  protected canvas: HTMLCanvasElement;
  protected ws: WebSocket | null = null;
  protected matchId: string | null = null;
  protected keys = new Set<string>();
  _running: boolean = false;
  _lastUpdate = Date.now();
  match: Match = { ...emptyMatch, score: { p1: 0, p2: 0 } };

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    const width = 800;
    const height = 600;
    this.canvas.width = width;
    this.canvas.height = height;

    this.settings = {
      width: width,
      height: height,
      paddleOffset: 12,
      paddleHeight: 120,
      paddleSpeed: 120 * 3,
      paddleSpeedup: 20,
      paddleSpeedMax: height * 0.9,
      ballRadius: 10,
      ballControl: true,
      ballInitialSpeed: width / 5,
      ballSpeedup: 30,
      ballSpeedMax: width,
      scoreNeeded: 5,
    }
    this.state = {
      paddleSpeed: 0,
      ball: { speed: 0, x: 0, y: 0, vx: 1, vy: 1 },
      p1: { y: 0, score: 0 },
      p2: { y: 0, score: 0 },
    };
    window.addEventListener('keydown', this.addKey);
    window.addEventListener('keyup', this.deleteKey);
    window.addEventListener('blur', this.clearKeys);
  }

  get running() {
    return this._running;
  }

  get lastUpdate() {
    return this._lastUpdate;
  }

  setSettings(settings: GameSettings) {
    this.settings = settings;
  }

  // Each GameClient instance can call wsConnect to get a web socket connection
  // with api-gateway.
  // All event listeners are out of the constructor for cleaner constructor.

  async wsConnect() {
    const token = sessionStorage.getItem("jwt");
    if (!token) {
      this.renderGameMessage(i18n.t("game.loginRequired"), i18n.t("game.loginRequiredSub"));
      console.warn("No token found. Not connecting.");
      throw new Error("No token found, not connecting to gameserver");
    }

    // Prevent duplicate or ongoing connections
    if (this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.warn("WebSocket is already connecting or open.");
      return;
    }

    // Create a web socket
    this.ws = new WebSocket("/api/game");

    // Add event listeners
    this.ws.addEventListener("open", () => {
      if (this.ws)
        this.ws.send(JSON.stringify({ type: "auth", token })); // Only read by api-gateway, and only sent once as first frame
      this.emit("connected");
    });
    this.ws.addEventListener("message", (event) => this.handleMessage(event));
    this.ws.addEventListener("close", (event) => {
      this.cleanup();
    });

    // Start ping
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 20000);
  }

  updateState(state: GameState) {
    this.state = state;
    this.renderGame();
    this._lastUpdate = Date.now();
  }

  sendReady() { }
  sendStart() { }
  sendStop() { }
  sendPause() { }
  async handleMessage(event: MessageEvent) {
    let text;
    if (event.data instanceof Blob) {
      text = await event.data.text();
    } else {
      text = event.data;
    }
  }

  protected onFinished(winner: "p1" | "p2") {
    if (this.interval) clearInterval(this.interval);
    this._running = false;
    this.match.score = { p1: this.state.p1.score, p2: this.state.p2.score };
    this.match.winner = winner === "p1" ? this.match.player1 : this.match.player2;
    this.emit("finished");
  }

  addKey = (e: KeyboardEvent) => {
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault(); // Disable scrolling with these keys.
    }

    if (e.key === " ") {
      if (this.running) {
        this.sendPause();
      } else {
        this.sendStart();
      }
      return;
    }

    this.keys.add(e.key);
  };
  deleteKey = (e: KeyboardEvent) => { this.keys.delete(e.key); };
  clearKeys = () => { this.keys.clear(); };

  renderGame() {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d')!;
    const state = this.state;
    const settings = this.settings;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgb(180, 180, 180)';
    for (let y = 10; y < canvas.height; y += 20) {
      ctx.fillRect(canvas.width / 2 - 1, y, 2, 10);
    }

    ctx.fillRect(settings.paddleOffset / 2, state.p1.y - settings.paddleHeight / 2, settings.paddleOffset / 2, settings.paddleHeight);
    ctx.fillRect(canvas.width - settings.paddleOffset, state.p2.y - settings.paddleHeight / 2, settings.paddleOffset / 2, settings.paddleHeight);

    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, settings.ballRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "38px serif";
    ctx.fillText(String(state.p1.score), canvas.width / 4, 38);
    ctx.fillText(String(state.p2.score), canvas.width * 3 / 4, 38);
  }

  renderGamePaused() {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d')!;
    const state = this.state;
    const settings = this.settings;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = "blur(4px)";

    ctx.fillStyle = 'rgb(180, 180, 180)';
    for (let y = 10; y < canvas.height; y += 20) {
      ctx.fillRect(canvas.width / 2 - 1, y, 2, 10);
    }

    ctx.fillRect(settings.paddleOffset / 2, state.p1.y - settings.paddleHeight / 2, settings.paddleOffset / 2, settings.paddleHeight);
    ctx.fillRect(canvas.width - settings.paddleOffset, state.p2.y - settings.paddleHeight / 2, settings.paddleOffset / 2, settings.paddleHeight);

    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, settings.ballRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "38px serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(String(state.p1.score), canvas.width / 4, 38);
    ctx.fillText(String(state.p2.score), canvas.width * 3 / 4, 38);

    ctx.filter = "blur(0px)";
    ctx.font = "50px serif";
    ctx.fillText(i18n.t("game.paused"), canvas.width / 2, canvas.height / 2);
  }

  renderGameMessage(reason: string, subtext: string = "") {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "60px serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(reason, canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "30px serif";
    ctx.fillText(subtext, canvas.width / 2, canvas.height / 2 + 20);
  }


  // Close connections and timer interval, guards this.ws existance
  cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.emit("disconnected");
    }
  }
}
