import { anchorsAddClicks } from "../utils/PageNavigator.ts";
import Page from "../utils/Page.ts";
import { State, User } from "../utils/State.ts";
import { generateTournament, Match, updateMatchResult } from "../utils/Tournament.ts";
import { MatchBlock } from "../WebComponents/MatchBlock.ts";
import { TournamentBracket } from "../WebComponents/TournamentBracket.ts";
import "../WebComponents/TournamentBracket.ts";
import "../WebComponents/FriendAvatar.ts";
import "../WebComponents/test.ts";
import "../WebComponents/Avatar.ts";
import { FriendAvatarDropdown } from "../WebComponents/FriendAvatar.ts";

export default class Dev extends Page {

  private keys = new Set<string>();

  constructor() {
    super();
    this.element.id = "dev-view";
  }

  async render() {
    this.element.innerHTML = `
<div class="relative flex flex-col text-center items-center gap-1">
  <div class="">
    <a data-link href="/dev">
      <h1 class="p-4 md:p-8 underline text-4xl md:text-6xl">Dev page</h1>
    </a>
  </div>
  <div class="relative grid grid-cols-3 gap-4">
    <div class="row-span-3 flex flex-col gap-2">
      <a data-link href="/dev/ping" class="btn btn-primary">Ping</a>
      <button id="guest-toggle" class="btn btn-primary">Toggle Guest</button>
      <button id="key-toggle" class="btn btn-primary">Toggle Key Test</button>
      <span><input id="n_players" type="tex" placeholder="#players 2-32 (def = 8)"/></span>
      <button id="test-tournament" class="btn btn-primary">Test tournament</button>
      <button id="toggle-status" class="btn btn-primary">Toggle Friend avatar Status</button>
    </div>
    <div class="col-span-2">
      <tr-friendavatar class="h-40 w-40"></tr-friendavatar>
      <div id="guest-content" class="m-2">
        Guest: ${State.user.isGuest}
      </div>
      <div id="key-display">
      </div>
      <div id="matches">
      </div>
    </div>
  </div>
  <div class="divider"></div>
  <tr-bracket class="w-full px-30"></tr-bracket>
</div>
`;
    return this.element;
  }

  async mount() {

    this.updateKeyHTML();

    anchorsAddClicks(this.element);

    const n_playersInput = this.element.querySelector("#n_players") as HTMLInputElement;
    this.element.querySelector("#test-tournament")?.addEventListener("click", () => {
      let n_players = (n_playersInput && n_playersInput.value) ? parseInt(n_playersInput.value) : 8;
      n_players = n_players ? n_players : 8;
      this.testTournament(n_players);
    });
    this.testTournament();

    this.element.querySelector("#guest-toggle")?.addEventListener("click", () => {
      const user = State.user;
      user.isGuest = !user.isGuest;
      State.setUser(user);
    })

    const guest = this.element.querySelector("#guest-content");
    if (guest) {
      State.addListener(
        "user",
        () => {
          const html = String.raw;
          guest.textContent = html`Guest: ${State.user.isGuest ? "True" : "False"}`;
        },
        this
      );
    }

    let keyListen = false;

    this.element.querySelector("#key-toggle")?.addEventListener("click", () => {
      if (keyListen) {
        window.removeEventListener('keydown', this.addKey);
        window.removeEventListener('keyup', this.deleteKey);
        window.removeEventListener('blur', this.clearKeys);
      } else {
        window.addEventListener('keydown', this.addKey);
        window.addEventListener('keyup', this.deleteKey);
        window.addEventListener('blur', this.clearKeys);
      }
      keyListen = !keyListen;
    })

    this.element.querySelector("#toggle-status")?.addEventListener("click", () => {
      const friendavatar = this.element.querySelector("tr-friendavatar") as FriendAvatarDropdown;
      if (!friendavatar) return;
      const user = friendavatar.user;
      user.online = !user.online;
      friendavatar.user = user;
    })

    const matchBlock = new MatchBlock();
    const p1 = { name: "Jhonthaniel the second coming", avatarUrl: "", isGuest: true };
    const p2 = { name: "Bobr", avatarUrl: "", isGuest: true };
    matchBlock.match = {
      id: "1",
      round: 2,
      player1: p1,
      player2: p2,
      winner: p1,
      score: { p1: 4, p2: 2 },
    }
    matchBlock.className = "text-xl w-50 mt-4";
    matchBlock.setAttribute("selectable", "");
    this.element.querySelector("#matches")?.appendChild(matchBlock);
  }

  addKey = (e: KeyboardEvent) => {
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault(); // Disable scrolling with these keys.
    }
    this.keys.add(e.key);
    this.updateKeyHTML();
  };
  deleteKey = (e: KeyboardEvent) => { this.keys.delete(e.key); this.updateKeyHTML() };
  clearKeys = () => { console.log("Focus lost, clearing Keys"); this.keys.clear(); this.updateKeyHTML() };

  unmount(): void {
    window.removeEventListener('keydown', this.addKey);
    window.removeEventListener('keyup', this.deleteKey);
    window.removeEventListener('blur', this.clearKeys);
    State.disconnectListeners(this);
  }

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

  attachedTournament = false;
  testTournament(n_players: number = 8) {

    const players: User[] = [
      { name: "Alice", avatarUrl: "", isGuest: false },
      { name: "Bob", avatarUrl: "", isGuest: false },
      { name: "Charlie", avatarUrl: "", isGuest: true },
      { name: "Dave", avatarUrl: "", isGuest: true },
      { name: "Eve", avatarUrl: "", isGuest: true },
      { name: "Fred", avatarUrl: "", isGuest: true },
      { name: "Gary", avatarUrl: "", isGuest: true },
      { name: "Homer", avatarUrl: "", isGuest: true },
      { name: "Isa", avatarUrl: "", isGuest: true },
      { name: "Jhon", avatarUrl: "", isGuest: true },
      { name: "Kereltje", avatarUrl: "", isGuest: true },
      { name: "Langzame man doet ook nog mee", avatarUrl: "", isGuest: true },
      { name: "Mr. M", avatarUrl: "", isGuest: true },
      { name: "N", avatarUrl: "", isGuest: false },
      { name: "O", avatarUrl: "", isGuest: false },
      { name: "P", avatarUrl: "", isGuest: true },
      { name: "Q", avatarUrl: "", isGuest: true },
      { name: "R", avatarUrl: "", isGuest: true },
      { name: "S", avatarUrl: "", isGuest: true },
      { name: "T", avatarUrl: "", isGuest: true },
      { name: "U", avatarUrl: "", isGuest: true },
      { name: "V", avatarUrl: "", isGuest: true },
      { name: "W", avatarUrl: "", isGuest: true },
      { name: "X", avatarUrl: "", isGuest: true },
      { name: "Y", avatarUrl: "", isGuest: true },
      { name: "Z", avatarUrl: "", isGuest: true },
      { name: "27", avatarUrl: "", isGuest: false },
      { name: "28", avatarUrl: "", isGuest: false },
      { name: "29", avatarUrl: "", isGuest: false },
      { name: "30", avatarUrl: "", isGuest: false },
      { name: "31", avatarUrl: "", isGuest: false },
      { name: "32", avatarUrl: "", isGuest: false },
    ];

    n_players = Math.max(2, Math.min(32, n_players));
    let tournament = generateTournament(players.slice(0, n_players));

    const br = this.element.querySelector("tr-bracket")! as TournamentBracket;
    br.tournament = tournament;

    if (this.attachedTournament) return;
    /**
     * random score and winner, update match and tell the tournament component to update its match blocks
     */
    br.addEventListener("tournament-match-selected", (e) => {
      const { match } = (e as CustomEvent).detail as { match: Match };
      const current = br.tournament;
      if (!current)
        return;
      if (!match.player1 || !match.player2)
        return;
      const p1score = Math.round(Math.random() * 10);
      const p2score = Math.round(Math.random() * 10);
      const winner = p1score > p2score ? match.player1 : match.player2;

      // Gets handled by the game itself later
      match.score = { p1: p1score, p2: p2score };
      match.winner = winner;

      const updatedMatch = updateMatchResult(current, match);
      br.updateMatch(match);
      if (updatedMatch) br.updateMatch(updatedMatch);
    })

    this.attachedTournament = true;
  }

}
