import { GameSettings, PlayerInput, PlayerSide } from "../schemas/messageSchemas.ts";
import { Emitter } from "../utils/Emitter.ts";
import { GamePhysics } from "./GamePhysics.ts";

/**
 * GameBase abstract class
 *
 * This is the base for the server side games, running the physics with a
 * GamePhysics object at a given tickRate.
 */
export abstract class GameBase extends Emitter {
  protected physics: GamePhysics;
  protected inputQueue: { side: PlayerSide, input: PlayerInput }[] = [];
  protected tickRate = 60;
  private interval: ReturnType<typeof setInterval> | null = null;
  _running: boolean = false;

  get running() {
    return this._running;
  }

  getSettings() {
    return this.physics.getSettings();
  }

  constructor(settings?: GameSettings) {
    super();
    this.physics = new GamePhysics(settings);

    this.on("started", () => this.handleStart());
    this.on("stopped", () => this.handleStopped());
    this.on("paused", () => this.handlePaused());
    this.on("finished", () => this.handleFinished());
  }

  protected handleStart(): void { };
  start() {
    const tickMs = 1000 / this.tickRate;
    this.interval = setInterval(() => this.tick(), tickMs);
    this._running = true;
    this.emit('started');
  }

  protected handleStopped(): void { };
  stop() {
    this._running = false;
    if (this.interval) clearInterval(this.interval);
    this.emit('stopped');
  }

  protected handleFinished(): void { };
  finish() {
    this._running = false;
    if (this.interval) clearInterval(this.interval);
    this.emit('finished');
  }

  protected handlePaused(): void { };
  pause() {
    this._running = false;
    if (this.interval) clearInterval(this.interval);
    this.emit('paused');
  }

  private tick() {
    this.processInputs();
    this.physics.updatePhysics(1 / this.tickRate);
    this.broadcastState();
    if (this.physics.getWinner()) {
      this.finish();
    }
  }

  /**
   * An array of inputs is used, this method pushes an input frame to the back of the queue
   *
   * @param side the player that sent the input frame
   * @param input the input frame to apply on the physics object
   */
  enqueueInput(side: PlayerSide, input: PlayerInput) {
    this.inputQueue.push({ side, input });
  }

  /**
   * Clears out the inputQueue applying each one on the physics object
   */
  protected processInputs() {
    while (this.inputQueue.length > 0) {
      const input = this.inputQueue.shift()!;
      this.physics.applyInput(input.side, input.input);
    }
  }

  /** Each subclass must implement how to send state updates */
  protected abstract broadcastState(): void;
}
