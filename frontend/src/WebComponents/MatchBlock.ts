import { emptyMatch, Match } from "../utils/Tournament";
import { styleSheet } from "../utils/StyleSheet";

/**
 * Match block web component
 *
 * Renders a single Match element.
 * Can be set to be selectable, sending an "match-selected" event on click with the match as detail.
 * Names to long get truncated, hover with mouse for full names by using title attribute.
 * Some styling gets done based on match state. No player is "TBD" with lower
 * opacity, Border based on amount of players and selectable attribute.
 */
export class MatchBlock extends HTMLElement {
  static observedAttributes = ["selectable"];

  private shadow: ShadowRoot;
  private selectable: boolean = false;
  private _match: Match = { ...emptyMatch };

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [styleSheet];
    this.render();
  }

  /**
  * Send out "match-selected" event when clicked
  * Sanity checks that there are 2 players in the match.
  */
  matchSelected = () => {
    if (!this._match.player1 || !this._match.player2) {
      return;
    }
    this.dispatchEvent(new CustomEvent("match-selected", {
      detail: { match: this._match },
      bubbles: true,
      composed: true,
    }));
  }

  connectedCallback() {
  }

  disconnectedCallback() {
    this.shadow.removeEventListener("click", this.matchSelected);
  }

  /**
  * Only listen for click if we have selectable attribute
  */
  attributeChangedCallback(name: string, _oldVal: any, newVal: any) {
    switch (name) {
      case "selectable":
        this.selectable = newVal !== null;
        this.render();
        if (this.selectable) {
          this.shadow.addEventListener("click", this.matchSelected);
        } else {
          this.shadow.removeEventListener("click", this.matchSelected);
        }
        break;
      default:
        break;
    }
  }

  /**
  * Setter for the match property. Renders the block again.
  */
  set match(m: Match) {
    this._match = m;
    this.render();
  }

  render() {
    this.shadow.innerHTML = `
<style>:host { display: inline-block; }</style>
<div class="h-20 border rounded-xl bg-base-200 shadow-md p-2 flex flex-col justify-center-safe items-center ${(this._match.player1 && !this._match.player2) || (!this._match.player1 && this._match.player2) ? "border-warning" : ""} ${this.selectable ? "cursor-pointer border-primary bg-neutral-900 hover:bg-neutral-800 transition" : ""}" title="${this._match.player1?.name ? this._match.player1.name : "TBD"} Vs. ${this._match.player2?.name ? this._match.player2.name : "TBD"}">
  <div class="w-full flex justify-between items-center">
    <span id="p1name" class="font-semibold block max-w-32 truncate text-ellipsis overflow-hidden whitespace-nowrap ${this._match.player1?.name ?? "opacity-50"}">TBD</span>
    <span class="flex-none ${(this._match.winner && this._match.winner === this._match.player1) ? "" : "opacity-0"}">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
        <path fill-rule="evenodd" d="M10 1c-1.828 0-3.623.149-5.371.435a.75.75 0 0 0-.629.74v.387c-.827.157-1.642.345-2.445.564a.75.75 0 0 0-.552.698 5 5 0 0 0 4.503 5.152 6 6 0 0 0 2.946 1.822A6.451 6.451 0 0 1 7.768 13H7.5A1.5 1.5 0 0 0 6 14.5V17h-.75C4.56 17 4 17.56 4 18.25c0 .414.336.75.75.75h10.5a.75.75 0 0 0 .75-.75c0-.69-.56-1.25-1.25-1.25H14v-2.5a1.5 1.5 0 0 0-1.5-1.5h-.268a6.453 6.453 0 0 1-.684-2.202 6 6 0 0 0 2.946-1.822 5 5 0 0 0 4.503-5.152.75.75 0 0 0-.552-.698A31.804 31.804 0 0 0 16 2.562v-.387a.75.75 0 0 0-.629-.74A33.227 33.227 0 0 0 10 1ZM2.525 4.422C3.012 4.3 3.504 4.19 4 4.09V5c0 .74.134 1.448.38 2.103a3.503 3.503 0 0 1-1.855-2.68Zm14.95 0a3.503 3.503 0 0 1-1.854 2.68C15.866 6.449 16 5.74 16 5v-.91c.496.099.988.21 1.475.332Z" clip-rule="evenodd" />
      </svg>
    </span>
    <span class="flex-none text-md">${this._match.score ? this._match.score.p1 : "---"}</span>
  </div>
  <div class="border-t border-gray-600 w-full my-1"></div>
  <div class="w-full flex justify-between items-center">
    <span id="p2name" class="font-semibold block max-w-32 truncate text-ellipsis overflow-hidden whitespace-nowrap ${this._match.player2?.name ?? "opacity-50"}">TBD</span>
    <span class="flex-none ${(this._match.winner && this._match.winner === this._match.player2) ? "" : "opacity-0"}">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
        <path fill-rule="evenodd" d="M10 1c-1.828 0-3.623.149-5.371.435a.75.75 0 0 0-.629.74v.387c-.827.157-1.642.345-2.445.564a.75.75 0 0 0-.552.698 5 5 0 0 0 4.503 5.152 6 6 0 0 0 2.946 1.822A6.451 6.451 0 0 1 7.768 13H7.5A1.5 1.5 0 0 0 6 14.5V17h-.75C4.56 17 4 17.56 4 18.25c0 .414.336.75.75.75h10.5a.75.75 0 0 0 .75-.75c0-.69-.56-1.25-1.25-1.25H14v-2.5a1.5 1.5 0 0 0-1.5-1.5h-.268a6.453 6.453 0 0 1-.684-2.202 6 6 0 0 0 2.946-1.822 5 5 0 0 0 4.503-5.152.75.75 0 0 0-.552-.698A31.804 31.804 0 0 0 16 2.562v-.387a.75.75 0 0 0-.629-.74A33.227 33.227 0 0 0 10 1ZM2.525 4.422C3.012 4.3 3.504 4.19 4 4.09V5c0 .74.134 1.448.38 2.103a3.503 3.503 0 0 1-1.855-2.68Zm14.95 0a3.503 3.503 0 0 1-1.854 2.68C15.866 6.449 16 5.74 16 5v-.91c.496.099.988.21 1.475.332Z" clip-rule="evenodd" />
      </svg>
    </span>
    <span class="flex-none text-md">${this._match.score ? this._match.score.p2 : "---"}</span>
  </div>
</div>
`;
    this.shadow.querySelector("#p1name")!.textContent = this._match.player1?.name ?? "TBD";
    this.shadow.querySelector("#p2name")!.textContent = this._match.player2?.name ?? "TBD";
  };
}

customElements.define("tr-matchblock", MatchBlock);
