import { Match, Tournament } from "../utils/Tournament";
import { styleSheet } from "../utils/StyleSheet";
import { MatchBlock } from "./MatchBlock";

/**
 * Tournament bracket web component
 *
 * Renders a bracket of matches based on a Tournament object.
 * Emits an event when a match gets clicked.
 */
export class TournamentBracket extends HTMLElement {
  static observedAttributes = [];

  private shadow: ShadowRoot;
  private _tournament: Tournament | null = null;
  private matchBlocks: Map<string, MatchBlock> = new Map();

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [styleSheet];
    this.render();
  }

  /**
   * When a match block sends the "match-selected" event, we send our own
   * custom event "tournament-match-selected"
   *
   * @param e The cusom "match-selected" event from MatchBlock element
   */
  private matchSelected = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    this.dispatchEvent(
      new CustomEvent("tournament-match-selected", {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  connectedCallback() {
    this.shadow.addEventListener("match-selected", this.matchSelected);
  }

  disconnectedCallback() {
    this.shadow.removeEventListener("match-selected", this.matchSelected);
  }

  attributeChangedCallback(name: string, _oldVal: any, _newVal: any) {
    switch (name) {
      default:
        break;
    }
  }

  /**
   * Setter for tournament, renders the tournament again.
   */
  set tournament(t: Tournament) {
    this._tournament = t;
    this.render();
  }

  get tournament(): Tournament | null {
    return this._tournament;
  }

  /**
   * Render the bracket, adding the match blocks in 'round' columns. Adds svg
   * connectors between the blocks to visualize the bracket flow.
   * Should only render once, update more finely with updateMatch function
   */
  render() {
    if (!this._tournament) return;
    const { rounds } = this._tournament;

    // Step 1: render structure including empty SVG
    this.shadow.innerHTML = `
<div class="relative">
  <div id="scroll_container" class="relative flex flex-row space-x-12 overflow-scroll p-4 border border-black rounded-md">
    <svg class="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-visible" xmlns="http://www.w3.org/2000/svg"></svg>
    ${rounds.map((round, i) => `
    <div class="flex flex-col space-x-20">
      <h3 class="flex-none text-lg font-bold mb-2 text-gray-700">Round ${i + 1}</h3>
      <div class="flex-1 flex flex-col space-y-12 justify-around items-center">
        ${round.map((match) => `
        <tr-matchblock
          class="w-40 ${match.autoadvanced ? "opacity-20 pointer-events-none" : "opacity-100"}"
          ${((!match.player1 || !match.player2) || match.winner) ? "" : "selectable"}>
        </tr-matchblock>`
    ).join("")}
      </div>
    </div>`).join("")}
  </div>
</div>
`;

    // Step 2: link the match blocks to their data
    this.matchBlocks.clear();
    const allMatches = this.shadow.querySelectorAll("tr-matchblock");
    let matchIndex = 0;
    rounds.forEach((round) => {
      round.forEach((match) => {
        const block = allMatches[matchIndex++] as MatchBlock;
        block.match = match;
        this.matchBlocks.set(match.id, block);
      });
    });

    // Step 3: once elements are rendered, draw connectors
    // Could do some animation or conditional styling/coloring but is good for now.
    requestAnimationFrame(() => {
      const svg = this.shadow.querySelector("svg");
      if (!svg) return;

      const scrollContainer = this.shadow.querySelector("#scroll_container");

      if (scrollContainer) {
        svg.setAttribute("width", `${scrollContainer.scrollWidth}px`);
        svg.setAttribute("height", `${scrollContainer.scrollHeight}px`);
      }

      const svgPaths: string[] = [];

      for (let r = 0; r < rounds.length - 1; r++) {
        const currentRound = rounds[r];
        const nextRound = rounds[r + 1];

        currentRound.forEach((match, i) => {
          const fromBlock = this.matchBlocks.get(match.id);
          const toBlock = nextRound[Math.floor(i / 2)]
            ? this.matchBlocks.get(nextRound[Math.floor(i / 2)].id)
            : null;

          if (!fromBlock || !toBlock) return;

          // Use the position data from the match blocks
          const fromRect = fromBlock.getBoundingClientRect();
          const toRect = toBlock.getBoundingClientRect();
          const svgRect = svg.getBoundingClientRect();

          // Compute coordinates relative to SVG
          const x1 = fromRect.right - svgRect.left;
          const y1 = fromRect.top + fromRect.height / 2 - svgRect.top;
          const x2 = toRect.left - svgRect.left;
          const y2 = toRect.top + toRect.height * (i % 2 ? 3 : 1) / 4 - svgRect.top;

          // Curved connector (smooth horizontal flow)
          const midX = (x1 + x2) / 2;
          const path = `M ${x1},${y1} C ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
          svgPaths.push(path);
        });
      }

      svg.innerHTML = svgPaths.map(p => `<path d="${p}" fill="none" stroke="#9ca3af" stroke-width="2" />`).join("\n");
    });
  }

  /**
  * Search for and update a single match block component. No full render is needed now.
  * Also updates if the block should now be selectable or not. Only selectable if 2 players and no winner yet.
  *
  * @param match The match to update for. Searched on match.id
  */
  updateMatch(match: Match) {
    const block = this.matchBlocks.get(match.id);
    if (block) {
      block.match = match;
      if ((!match.player1 || !match.player2) || match.winner) {
        block.removeAttribute("selectable");
      } else {
        block.setAttribute("selectable", "");
      }
    } else {
      console.warn(`No MatchBlock found for ${match.id}`);
    }
  }
}

customElements.define("tr-bracket", TournamentBracket);
