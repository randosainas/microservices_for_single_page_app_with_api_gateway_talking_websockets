import { WebSocket, RawData } from "ws";
import { GameBase } from "./GameBase.ts";
import { GameLocal } from "./GameLocal.ts";
import { GameOnline } from "./GameOnline.ts";
import { getClientMessageData, sendServerError } from "../schemas/messageUtils.ts";
import { EventEmitter } from "events";
import { GameSettings, schemaServerGameReady, User } from "../schemas/messageSchemas.ts";
import { WSClient } from "../types/WSClient.ts";

/**
 * GameManager
 *
 * Is the first point of websocket connection at the gameserver side.
 * It keeps track of the clients connecting, and listens for certain messages
 * asking to start a game or join an online queue.
 * When a game gets prepared, the message event listener gets removed, it gets handled by the game.
 * After a game is prepared, it holds it as an active game, deleting it after it's stopped/finished.
 * GameManager still keeps track and keeps the connection alive.
 */

interface QueuedPlayer {
  ws: WSClient;
  user: User;
}

export class GameManager extends EventEmitter {
  private connections = new Set<WSClient>();
  private waitingPlayers: QueuedPlayer[] = [];
  private games: Map<string /** matchId */, GameBase> = new Map();

  handleConnection(ws: WebSocket) {
    const client = ws as WSClient;
    this.connections.add(client);

    client.isAlive = true;

    client.on("message", (data, isBinary) => this.onMessage(client, data, isBinary));
    client.on("close", () => this.onClose(client));
    client.on('pong', () => client.isAlive = true);

    client.interval = setInterval(() => {
      if (!client.isAlive) {
        return client.terminate();
      }
      client.isAlive = false;
      client.ping();
    }, 25000); // check if alive every 25s
  }

  private onMessage(ws: WSClient, raw: RawData, isBinary: boolean) {
    if (isBinary) {
      sendServerError(ws, "Binary messages are not supported");
      return;
    }

    const msg = getClientMessageData(ws, raw);
    if (!msg)
      return;

    console.log(`Client message: ${JSON.stringify(msg)}`);

    switch (msg.type) {
      case "local1v1":
        this.startLocal1v1(ws, msg.payload.settings);
        break;

      case "queue-join":
        this.queueAddPlayer(ws, msg.payload.user);
        break;

      case "ping":
        ws.pong();
        break;

      default:
        sendServerError(ws, "Unexpected message type");
        break;
    }
  }

  private startLocal1v1(ws: WSClient, settings: GameSettings) {
    ws.removeAllListeners("message");
    const game = new GameLocal(ws, settings);
    this.games.set(game.id, game);
    game.on('finished', () => {
      console.log(`Finished: Local game ${game.id}`);
      this.games.delete(game.id);
      ws.on("message", (data, isBinary) => this.onMessage(ws, data, isBinary));
    });
    game.on('stopped', () => {
      console.log(`Stopped: Local game ${game.id}`);
      this.games.delete(game.id);
      game.cleanup();
      ws.on("message", (data, isBinary) => this.onMessage(ws, data, isBinary));
    });
    console.log(`Initialized: Local game: ${game.id}`);
    ws.send(JSON.stringify(schemaServerGameReady.parse({ type: "game-ready", payload: { matchId: game.id, settings: game.getSettings() } })));
  }

  private queueAddPlayer(ws: WSClient, data: User) {
    // Check of deze ws al in de queue zit
    if (this.waitingPlayers.some(p => p.ws === ws)) return;

    // Maak een player object met ws en user data
    const player: QueuedPlayer = {
      ws: ws,
      user: {
        name: data.name,
        avatarUrl: data.avatarUrl,
        isGuest: data.isGuest || true,
      }
    };

    this.waitingPlayers.push(player);
    console.log(`Player ${player.user.name} queued (${this.waitingPlayers.length}/2)`);

    if (this.waitingPlayers.length >= 2) {
      const [p1, p2] = this.waitingPlayers.splice(0, 2);
      this.startOnline1v1(p1, p2);
    }
  }

  private startOnline1v1(p1: QueuedPlayer, p2: QueuedPlayer) {
    p1.ws.removeAllListeners("message");
    p2.ws.removeAllListeners("message");

    const game = new GameOnline(p1.ws, p2.ws);
    this.games.set(game.id, game);
    game.on('finished', () => {
      console.log(`Finished: Online game ${game.id}`);
      this.games.delete(game.id);
      p1.ws.on("message", (data, isBinary) => this.onMessage(p1.ws, data, isBinary));
      p2.ws.on("message", (data, isBinary) => this.onMessage(p2.ws, data, isBinary));

      this.sendGameResults(game, p1, p2);

    });
    game.on('stopped', () => {
      console.log(`Stopped: Online game ${game.id}`);
      this.games.delete(game.id);
      game.cleanup();
      p1.ws.on("message", (data, isBinary) => this.onMessage(p1.ws, data, isBinary));
      p2.ws.on("message", (data, isBinary) => this.onMessage(p2.ws, data, isBinary));
    });
    console.log(`Initialized: Online game: ${game.id}`);

    // Stuur de game-ready message MET player data
    const gameReadyPayload1 = {
      type: "game-ready",
      payload: {
        matchId: game.id,
        settings: game.getSettings(),
        players: {
          player1: p1.user, // Jouw data
          player2: p2.user  // Tegenstander data
        }
      }
    };

    p1.ws.send(JSON.stringify(schemaServerGameReady.parse(gameReadyPayload1)));
    p2.ws.send(JSON.stringify(schemaServerGameReady.parse(gameReadyPayload1)));
  }

  private queueRemovePlayer(ws: WSClient) {
    this.waitingPlayers = this.waitingPlayers.filter((p) => p.ws !== ws);
  }

  private onClose(ws: WSClient) {
    clearInterval(ws.interval);
    this.connections.delete(ws);
    this.queueRemovePlayer(ws);
    // If in a game, game will handle disconnection
  }

  private async sendGameResults(game: GameOnline, p1: QueuedPlayer, p2: QueuedPlayer) {

    const resultPayload = {
      type: "game-result",
      payload: {
        id: game.id,
        time: game.getPlayTime(),
        player1: p1.user.name,
        player2: p2.user.name,
        player1Won: game.player1Won(),
        score: game.getScore(),
      }
    };

    try {
      await fetch("http://user-manager:3000/games", { // TODO: set correct URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultPayload)
      });
    } catch (err) {
      console.error("Failed to notify user manager:", err);
    }
  }
}
