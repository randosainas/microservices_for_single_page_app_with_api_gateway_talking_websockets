import { GameClientBase } from "../utils/GameClientBase.ts";
import { GameClientLocal } from "../utils/GameClientLocal.ts";
import { GameClientOnline } from "../utils/GameClientOnline.ts";
import { styleSheet } from "../utils/StyleSheet";
import { MatchBlock } from "./MatchBlock";
import { guestUser, State, User } from "src/utils/State.ts";
import { FriendAvatarDropdown } from "../WebComponents/FriendAvatar.ts";
import { emptyMatch, Match } from "src/utils/Tournament.ts";
import "../WebComponents/MatchBlock.ts";
import "../WebComponents/FriendAvatar.ts";
import { i18n } from "../utils/i18n"

/**
 */
export class GameElement extends HTMLElement {
  static observedAttributes = ["type"];

  private shadow: ShadowRoot;
  private game?: GameClientBase;
  private local: boolean = true;
  private match: Match = { ...emptyMatch, player1: { ...guestUser }, player2: { ...guestUser } };
  private matchBlock: MatchBlock;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [styleSheet];
    this.render();

    this.matchBlock = this.shadow.querySelector("tr-matchblock")!;
  }

  setMatch(u: Match) {
    const pong = this.shadow.querySelector("#pong")!;
    const queued = this.shadow.querySelector("#queued-message")!;
    pong.classList.remove("hidden");
    queued.classList.add("hidden");
    this.matchBlock.classList.add("hidden");
    this.match = u;
    this.game!.match = u;
    this.matchBlock.match = u;
  }

  connectedCallback() {
    if (this.local)
      this.game = new GameClientLocal(this.shadow.querySelector("canvas")!);
    else
      this.game = new GameClientOnline(this.shadow.querySelector("canvas")!);

    const pong = this.shadow.querySelector("#pong")!;
    const queued = this.shadow.querySelector("#queued-message")!;
    const p1Avatar = this.shadow.querySelector("#p1-avatar")! as FriendAvatarDropdown;
    const p2Avatar = this.shadow.querySelector("#p2-avatar")! as FriendAvatarDropdown;

    // ---- When match is finished ----
    this.game.on("finished", () => {
      this.match = this.game!.match;
      this.matchBlock.match = this.match;

      // Show match results, hide others
      pong.classList.add("hidden");
      queued.classList.add("hidden");
      p1Avatar.classList.add("hidden");
      p2Avatar.classList.add("hidden");
      this.matchBlock.classList.remove("hidden");
      this.matchBlock.render();

      this.dispatchEvent(
        new CustomEvent("match-done", {
          detail: { match: this.match },
          bubbles: true,
          composed: true,
        })
      );
    });

    // ---- When players are updated (e.g. waiting in queue) ----
    this.game.on("players-updated", () => {
      const p1 = this.game!.match.player1!;
      const p2 = this.game!.match.player2!;

      p1Avatar.user = p1;
      p2Avatar.user = p2;

      // Show spinner while queued
      // queued.classList.remove("hidden");
      // pong.classList.add("hidden");
      this.matchBlock.classList.add("hidden");
    });

    // ---- When both players are ready and game starts ----
    this.game.on("ready", () => {
      if (this.match.winner) {
        return;
      }

      const match = this.match;
      const p1 = match.player1!;
      const p2 = match.player2!;

      p1Avatar.user = p1;
      p2Avatar.user = p2;

      // Hide spinner, show game and avatars
      queued.classList.add("hidden");
      this.matchBlock.classList.add("hidden");
      p1Avatar.classList.remove("hidden");
      p2Avatar.classList.remove("hidden");
      pong.classList.remove("hidden");
    });

    this.game.on("auth-success", () => {
      // yay, let's play
    });

    this.game.on("auth-fail", () => {
      // TODO: Could be handled a bit nicer, perhaps dispatch an event here as
      // well and have listeners handle displaying why the connection doesn't
      // work.
      State.notify("Your session has expired or is invalid. Please log in again.", true);
    })

    this.game.on("disconnected", () => {
      this.dispatchEvent(
        new CustomEvent("disconnected", {
          detail: {},
          bubbles: true,
          composed: true,
        })
      );
    });

    this.game.on("connected", () => {
      this.dispatchEvent(
        new CustomEvent("connected", {
          detail: {},
          bubbles: true,
          composed: true,
        })
      );
    });
  }

  disconnectedCallback() {
    this.game?.cleanup();
  }

  sendReady() {
    this.game?.sendReady();

    const pong = this.shadow.querySelector("#pong")!;
    const queued = this.shadow.querySelector("#queued-message")!;
    const p1 = this.shadow.querySelector("#p1-avatar")!;
    const p2 = this.shadow.querySelector("#p2-avatar")!;
    const matchBlock = this.matchBlock;

    // Explicitly hide everything except spinner
    pong.classList.add("hidden");
    matchBlock.classList.add("hidden");
    p1.classList.add("hidden");
    p2.classList.add("hidden");
    queued.classList.remove("hidden");
  }

  async wsConnect() {
    await this.game?.wsConnect();
  }

  sendStart() {
    this.game?.sendStart();
  }

  sendStop() {
    this.game?.sendStop();
  }

  sendPause() {
    this.game?.sendPause();
  }

  attributeChangedCallback(name: string, _oldVal: any, _newVal: any) {
    if (name === "type") {
      this.local = _newVal === "local";
    }
  }

  render() {
    this.shadow.innerHTML = `
<style>:host { display: inline-block; }</style>
<card class="card bg-base-200 min-w-100">
  <div id="card" class="card-body">
    <div id="players" class="grid grid-cols-2">
      <tr-friendavatar id="p1-avatar" side="left" class="hidden"></tr-friendavatar>
      <tr-friendavatar id="p2-avatar" side="right" class="hidden"></tr-friendavatar>
    </div>
    <canvas id="pong" class="hidden relative border rounded-sm m-auto"></canvas>
    <div id="queued-message" class="flex flex-col items-center justify-center text-center">
      <div class="mb-3">
        ${i18n.t("queueMessage")}
      </div>
      <span role="status" class="flex justify-center items-center w-8 h-8">
        <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 
               22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 
               73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 
               50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 
               9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 
               33.5539C95.2932 28.8227 92.871 24.3692 89.8167 
               20.348C85.8452 15.1192 80.8826 10.7238 75.2124 
               7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 
               1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 
               1.27873C39.2613 1.69328 37.813 4.19778 38.4501 
               6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 
               10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 
               10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 
               15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 
               25.841C84.9175 28.9121 86.7997 32.2913 88.1811 
               35.8758C89.083 38.2158 91.5421 39.6781 
               93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <span class="sr-only">Loading...</span>
      </span>
    </div>
    <tr-matchblock class="hidden text-xl w-60 mt-6 mx-auto"></tr-matchblock>
  </div>
</card>
`;
  }
}

customElements.define("tr-game", GameElement);
