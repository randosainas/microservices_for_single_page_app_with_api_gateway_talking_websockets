import { guestUser, State } from "../utils/State.ts";
import { PlayerField } from "../WebComponents/PlayerField.ts";
import Page from "../utils/Page.ts";
import { generateTournament, Match, updateMatchResult } from "../utils/Tournament.ts";
import { TournamentBracket } from "../WebComponents/TournamentBracket.ts";
import '../WebComponents/TournamentBracket.ts';
import '../WebComponents/MatchBlock.ts';
import '../WebComponents/GameElement.ts'
import "../WebComponents/PlayerField.ts";
import "../WebComponents/LanguageSwitcher.ts";
import { GameElement } from "src/WebComponents/GameElement.ts";
import { i18n } from "../utils/i18n.ts";

const BRACKET_MAX_PLAYERS: number = 32;
const BRACKET_MIN_PLAYERS: number = 2;

export default class Bracket extends Page {

  private playerList: HTMLElement | null = null;
  private gameElement: GameElement | null = null;

  constructor() {
    super();
    State.clearPlayers();
  }

  async render() {
    super.render();
    this.element.innerHTML = `
<div class="relative flex flex-col items-center text-center object-center">

  <card id="setting-menu" class="card bg-base-200 w-full max-w-[90vw] mt-10">
    <div class="card-body">
      <fieldset class="fieldset gap-2">
        <legend class="fieldset-legend">${i18n.t('play.gameSettings')}</legend>

        <div class="relative flex flex-row justify-center gap-4">
          <button id="btn-start" class="flex-1 btn btn-primary">${i18n.t('common.start')}</button>
          <button id="back" class="btn btn-secondary">${i18n.t('nav.back')}</button>
        </div>
        <div class="relative flex flex-row justify-center gap-4">
          <button id="addplayer-8" class="btn btn-soft btn-accent">${i18n.t('bracket.add8Players')}</button>
          <button id="addplayer" class="btn btn-soft btn-accent">${i18n.t('bracket.add1Player')}</button>
        </div>
      </fieldset>

      <div role="alert" id="alert-playercount" class="alert alert-error alert-soft hidden">
        ${i18n.t('bracket.playerCountAlert', {
      min: BRACKET_MIN_PLAYERS.toString(),
      max: BRACKET_MAX_PLAYERS.toString()
    })}
      </div>

      <ul role="list" id="player-list" class="list gap-y-1 grid grid-cols-1 md:grid-cols-2 gap-x-2"></ul>
    </div>
  </card>

  <tr-game id="game" class="hidden mt-10"></tr-game>
  <tr-bracket id="bracket" class="w-full px-30 mt-10"></tr-bracket>
  <button id="continue" class="hidden btn btn-primary mt-8">${i18n.t('bracket.continue')}</button>
</div>`;
    return this.element;
  };

  async mount() {
    super.mount();

    this.gameElement = this.element.querySelector("#game");
    if (!this.gameElement) {
      throw new Error("Unexpected error");
    }

    try {
      await this.gameElement.wsConnect();
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


    State.clearPlayers();
    State.addPlayer({ ...guestUser, name: "" });
    State.addPlayer({ ...guestUser, name: "" });
    State.addPlayer({ ...guestUser, name: "" });
    State.addPlayer({ ...guestUser, name: "" });
    this.playerList = this.element.querySelector("#player-list");
    this.updatePlayersHTML();
    State.addListener("players", () => { this.updatePlayersHTML(); }, this);
    State.addListener("players", () => {
      this.element.querySelector("#alert-playercount")?.classList.toggle("hidden", this.hasGoodAmountPlayers());
    }, this);

    this.element.querySelector('#addplayer')?.addEventListener('click', () => {
      if (State.players.length >= BRACKET_MAX_PLAYERS) {
        return;
      }
      State.addPlayer({ ...guestUser, name: "" });
    });

    this.element.querySelector('#addplayer-8')?.addEventListener('click', () => {
      for (let i = 0; i < 8; ++i) {
        if (State.players.length >= BRACKET_MAX_PLAYERS) {
          return;
        }
        State.addPlayer({ ...guestUser, name: "" });
      }
    });

    this.element.querySelector('#back')?.addEventListener('click', () => {
      history.back();
    });

    const btnStart = this.element.querySelector("#btn-start");
    if (btnStart) {
      btnStart.addEventListener("click", () => {
        if (!this.hasGoodAmountPlayers()) {
          return;
        }
        this.playerList?.childNodes.values().forEach((child) => {
          (child as PlayerField).placeholderAsName();
        })
        this.element.querySelector("#setting-menu")?.classList.toggle("hidden", true);
        this.startTournament();
      })
    }

    this.element.querySelector("#continue")?.addEventListener("click", () => {
      this.element.querySelector("#bracket")?.classList.toggle("hidden", false);
      this.gameElement?.classList.toggle("hidden", true);
      this.element.querySelector("#continue")?.classList.toggle("hidden", true);
    })
  }

  hasGoodAmountPlayers(): boolean {
    if (State.players.length < BRACKET_MIN_PLAYERS || BRACKET_MAX_PLAYERS < State.players.length) {
      return false;
    }
    return true;
  }

  startTournament() {
    let tournament = generateTournament(State.players);

    const br = this.element.querySelector("#bracket")! as TournamentBracket;
    br.tournament = tournament;

    // TODO: Actually go and play a game. (stay here and hide bracket, show game and start button).
    br.addEventListener("tournament-match-selected", (e) => {
      const { match } = (e as CustomEvent).detail as { match: Match };
      const current = br.tournament;
      if (!current)
        return;
      if (!match.player1 || !match.player2)
        return;

      this.element.querySelector("#bracket")?.classList.toggle("hidden", true);
      this.gameElement?.classList.toggle("hidden", false);

      this.gameElement?.setMatch(match);
      this.gameElement?.sendReady();

      this.gameElement?.addEventListener("match-done", () => {
        this.element.querySelector("#bracket")?.classList.toggle("hidden", true);
        this.gameElement?.classList.toggle("hidden", false);
        this.element.querySelector("#continue")?.classList.toggle("hidden", false);
        const updatedMatch = updateMatchResult(current, match);
        br.updateMatch(match);
        if (updatedMatch) br.updateMatch(updatedMatch);
      })
    })
  }

  updatePlayersHTML() {
    if (!this.playerList) {
      return;
    }
    this.playerList.innerHTML = '';
    State.players.forEach((u, i) => {
      const playerField = new PlayerField(u, i18n.t('play.player') + " " + String(i + 1));
      this.playerList?.appendChild(playerField);
    })
  }

  unmount(): void {
    super.unmount();
    State.disconnectListeners(this);
  }
}
