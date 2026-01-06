import { guestUser, State } from "../utils/State.ts";
import Page from "../utils/Page.ts";
import { PlayerField } from "../WebComponents/PlayerField.ts";
import { GameElement } from "../WebComponents/GameElement.ts";
import { emptyMatch, Match } from "src/utils/Tournament.ts";
import "../WebComponents/PlayerField.ts";
import "../WebComponents/GameElement.ts";
import "../WebComponents/LanguageSwitcher.ts";
import { i18n } from "src/utils/i18n.ts";

export default class Play extends Page {

  private playerList: HTMLElement | null = null;
  private game: GameElement | null = null;

  constructor() {
    super();
    this.element.id = "play-view";
  }

  async render() {
    super.render();
    this.element.innerHTML = `
<div class="relative flex flex-col items-center text-center object-center">
  <h1 class="p-8 text-6xl">Pong!</h1>
  <tr-game type="local" id="pong" class="hidden"></tr-game>
  <card id="setting-menu" class="card bg-base-200 w-full max-w-md ">
    <div class="card-body">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">${i18n.t('play.gameSettings')}</legend>

        <ul role="list" id="player-list" class="list gap-y-1">
        </ul>

        <div class="divider"></div>
        <div class="relative flex flex-row justify-center gap-4">
          <button id="btn-start" class="flex-1 btn btn-primary">${i18n.t('common.start')}</button>
          <button id="back" class="btn btn-secondary">${i18n.t('nav.back')}</button>
        </div>
      </fieldset>
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

    // this.game.addEventListener("connected", () => {
    //   console.log("Game ws connected");
    // })
    //
    // this.game.addEventListener("disconnected", () => {
    //   console.log("Game ws disconnected");
    // })

    /** NOTE: If we do want to handle resizing and dynamically changing the canvas size,
      * We either need a message schema to update the settings (dimensions) and handle it correctly, could have some complexity.
      * Or we unlink the server/frontend canvas size. The server only works with
      * width and height in range [0, 1], and the frontend just converts to
      * correct size. This could be a good approach, maybe added complexity in online? idk.
      */
    // this.resize();
    // addEventListener("resize", this.resize);

    State.clearPlayers();
    State.addPlayer({ ...guestUser, name: "" });
    State.addPlayer({ ...guestUser, name: "" });
    this.playerList = this.element.querySelector("#player-list");
    this.updatePlayersHTML();
    State.addListener("players", () => { this.updatePlayersHTML() }, this);

    this.element.querySelector('#back')?.addEventListener('click', () => {
      history.back();
    });

    const btnStart = this.element.querySelector("#btn-start");
    if (btnStart) {
      btnStart.addEventListener("click", () => {
        this.playerList?.childNodes.values().forEach((child) => {
          (child as PlayerField).placeholderAsName();
        })
        this.element.querySelector("#pong")?.classList.remove("hidden");
        this.element.querySelector("#setting-menu")?.classList.add("hidden");

        const match: Match = {
          ...emptyMatch,
          player1: State.players[0],
          player2: State.players[1],
        }

        this.game?.setMatch(match);
        this.game?.sendReady();
      })
    }
  };

  updatePlayersHTML() {
    if (!this.playerList) {
      return;
    }
    this.playerList.innerHTML = '';
    State.players.forEach((u, i) => {
      const playerField = new PlayerField(u, i18n.t('play.player') + " " + String(i + 1), false);
      this.playerList?.appendChild(playerField);
    })
  }

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
