import { State, User } from "../utils/State.ts";
import { styleSheet } from "../utils/StyleSheet.ts";

export class PlayerField extends HTMLElement {
  static observedAttributes = [];

  private shadow: ShadowRoot;
  private _user: User;

  constructor(u: User, private placeholder: string, removable = true) {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [styleSheet];
    this.render();
    this._user = u;
    this.shadow.querySelector("#text-input")?.setAttribute("placeholder", placeholder);
    if (!removable) {
      this.shadow.querySelector("#remove")?.classList.add("hidden");
    }
  }

  get user() {
    return this._user;
  }

  placeholderAsName() {
    const nameInput = this.shadow.querySelector("input")!;
    this._user.name = nameInput.value
      ? nameInput.value
      : this.placeholder
        ? this.placeholder
        : "Player";
  }

  connectedCallback() {
    const nameInput = this.shadow.querySelector("input")!;
    nameInput.value = this._user.name;
    nameInput.addEventListener("input", () => {
      this._user.name = nameInput.value;
    })

    this.shadow.querySelector("#remove")?.addEventListener("click", () => {
      State.removePlayer(this.user);
    })

    this.shadow.querySelector("#clear")?.addEventListener("click", () => {
      this._user.name = "";
      nameInput.value = "";
    })
  }

  disconnectedCallback() {
  }

  attributeChangedCallback(name: string, _oldVal: any, newVal: any) {
    switch (name) {
      default:
        break;
    }
  }

  render() {
    this.shadow.innerHTML = `
<div class="flex flex-row w-full gap-x-1">
  <input id="text-input" type="text" placeholder="Player name" class="flex-1 text-lg origin-center accent-accent bg-base-300 rounded px-2"/>
  <button id="clear" class="btn btn-soft btn-info btn-sm flex-none">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
      <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clip-rule="evenodd" />
    </svg>
  </button>
  <button id="remove" class="btn btn-soft btn-error btn-sm flex-none">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  </button>
</div>
`};
}

customElements.define("tr-playerfield", PlayerField);
