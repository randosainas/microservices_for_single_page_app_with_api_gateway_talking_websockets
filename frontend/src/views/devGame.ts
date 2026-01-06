import Page from "../utils/Page.ts";
import { GameClientLocal } from "../utils/GameClientLocal.ts";

export default class devGame extends Page {

  private keys = new Set<string>();
  private game: GameClientLocal | null = null;

  constructor() {
    super();
  }

  async render() {
    this.element.className = "text-center";
    this.element.innerHTML = `
<h1 id="message" class="p-4 md:p-8 text-4xl md:text-6xl">Not connected with WebSocket</h1>
<div class="mt-2">
  <button class="btn btn-secondary" id="connect">Connect</button>
  <button class="btn btn-secondary" id="stop">Stop Local</button>
  <button class="btn btn-secondary" id="ready-local">Ready Local</button>
  <button class="btn btn-secondary" id="back">Back</button>
  <div id="key-display" class="my-4"></div>
  <canvas id="pong" class="relative border m-auto"></canvas>
</div>`;
    return this.element;
  };

  addKey = (e: KeyboardEvent) => {
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault(); // Disable scrolling with these keys.
    }

    this.keys.add(e.key);
    this.updateKeyHTML();
  };
  deleteKey = (e: KeyboardEvent) => { this.keys.delete(e.key); this.updateKeyHTML(); };
  clearKeys = () => { console.log("Focus lost, clearing Keys"); this.keys.clear(); this.updateKeyHTML(); };

  updateKeyHTML() {
    const keydisp = this.element.querySelector("#key-display");
    if (!keydisp)
      return;
    keydisp.innerHTML = `
Test Keys:
<div class="flex w-full justify-center">
  <kbd class="kbd ${this.keys.has('w') ? "bg-teal-600" : "bg-base-200"}">w</kbd>
  <kbd class="kbd ${this.keys.has('a') ? "bg-teal-600" : "bg-base-200"}">a</kbd>
  <kbd class="kbd ${this.keys.has('s') ? "bg-teal-600" : "bg-base-200"}">s</kbd>
  <kbd class="kbd ${this.keys.has('d') ? "bg-teal-600" : "bg-base-200"}">d</kbd>
</div>
<div class="flex w-full justify-center">
  <kbd class="kbd ${this.keys.has('ArrowUp') ? "bg-teal-600" : "bg-base-200"}">&uarr;</kbd>
  <kbd class="kbd ${this.keys.has('ArrowLeft') ? "bg-teal-600" : "bg-base-200"}">&larr;</kbd>
  <kbd class="kbd ${this.keys.has('ArrowDown') ? "bg-teal-600" : "bg-base-200"}">&darr;</kbd>
  <kbd class="kbd ${this.keys.has('ArrowRight') ? "bg-teal-600" : "bg-base-200"}">&rarr;</kbd>
</div>`;
  }

  async mount() {
    const messageElement = this.element.querySelector('#message')!;
    /** WebSocket from Web API and is different from the backend 'ws' provided WebSocket */

    const cleanUpGame = () => {
      this.game?.cleanup();
      this.game = null;
    }

    this.element.querySelector('#back')?.addEventListener('click', () => {
      this.game?.cleanup();
      history.back();
    });

    this.updateKeyHTML();
    window.addEventListener('keydown', this.addKey);
    window.addEventListener('keyup', this.deleteKey);
    window.addEventListener('blur', this.clearKeys);

    this.element.querySelector("#connect")?.addEventListener("click", async () => {
      if (!this.game) {
        this.game = new GameClientLocal(this.element.querySelector("#pong")!);
        this.game.on("stopped", cleanUpGame);
        this.game.on("finished", cleanUpGame);

        // Init authentification
        await this.game.wsConnect();
      }
    })
    this.element.querySelector("#stop")?.addEventListener("click", cleanUpGame);

    this.element.querySelector("#ready-local")?.addEventListener("click", () => {
      this.game?.sendReady();
    })
  }

  unmount(): void {
    if (this.game) {
      this.game.sendStop();
      this.game.cleanup();
    }
    window.removeEventListener('keydown', this.addKey);
    window.removeEventListener('keyup', this.deleteKey);
    window.removeEventListener('blur', this.clearKeys);
  }
}
