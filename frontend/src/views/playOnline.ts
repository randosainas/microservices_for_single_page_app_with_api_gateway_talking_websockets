import { State } from "../utils/State.ts";
import Page from "../utils/Page.ts";
import { GameElement } from "../WebComponents/GameElement.ts";
import "../WebComponents/PlayerField.ts";
import "../WebComponents/GameElement.ts";
import "../WebComponents/LanguageSwitcher.ts";
import { i18n } from "../utils/i18n.ts";

export default class Play extends Page {

  private game: GameElement | null = null;

  constructor() {
    super();
    this.element.id = "play-view";
    State.clearPlayers();
  }

  async render() {
    super.render();
    this.element.innerHTML = `
<div class="relative flex flex-col items-center text-center object-center">
  <h1 class="p-8 text-6xl">Pong!</h1>
  <tr-game type="online" id="pong" class="hidden"></tr-game>
  <card id="setting-menu" class="card bg-base-200 w-full max-w-md ">
    <div class="card-body">
        <div class="relative flex flex-row justify-center gap-4">
          <button id="btn-start" class="flex-1 btn btn-primary">${i18n.t('common.start')}</button>
          <button id="back" class="btn btn-secondary">${i18n.t('nav.back')}</button>
        </div>
    </div>
  </card>
</div>`;
    return this.element;
  };

  async mount() {
    super.mount();
    this.game = this.element.querySelector('#pong');
    if (!this.game) {
      throw new Error("Unexpected error");
    }

    try {
      await this.game.wsConnect();
    } catch (error) {
      State.notify(i18n.t("game.connect-error"));
      // console.error("Error connecting websocket: ", error);
    }

    /** NOTE: If we do want to handle resizing and dynamically changing the canvas size,
      * We either need a message schema to update the settings (dimensions) and handle it correctly, could have some complexity.
      * Or we unlink the server/frontend canvas size. The server only works with
      * width and height in range [0, 1], and the frontend just converts to
      * correct size. This could be a good approach, maybe added complexity in online? idk.
      */
    // this.resize();
    // addEventListener("resize", this.resize);

    this.element.querySelector('#back')?.addEventListener('click', () => {
      history.back();
    });


    const btnStart = this.element.querySelector("#btn-start");
    if (btnStart) {
      btnStart.addEventListener("click", () => {
        this.element.querySelector("#setting-menu")?.classList.add("hidden");
        this.element.querySelector("#pong")?.classList.remove("hidden");
        this.game?.sendReady();
      })
    }
  };

  // INFO
  // Arrow function to capture 'this' lexically, i.e. always the Play class instance
  // Needed to avoid a '.bind(this)' when using as window event callback.
  // '.bind()' creates a new function reference, so removing requires storing the original bound function
  // Without the bind (or arrow function) 'this' would be the window instance inside the callback
  resize = () => {
    const canvas = this.element.querySelector('#pong') as HTMLCanvasElement;
    const rect = canvas?.parentElement?.getBoundingClientRect()!;
    let { width, height } = rect;
    // 400 <= width <= 800 with margin of 40 on each side
    width = Math.max(400, Math.min(800, width - 80));
    height = width * 0.6; // keep aspect ratio nice
    canvas.setAttribute("width", String(width));
    canvas.setAttribute("height", String(height));
  };

  unmount() {
    super.unmount();
    removeEventListener("resize", this.resize);
    State.disconnectListeners(this);
  }

}
