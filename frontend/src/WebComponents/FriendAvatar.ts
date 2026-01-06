import { safeImageHref } from "src/utils/safeImageHref.ts";
import { guestUser, User } from "../utils/State.ts";
import { styleSheet } from "../utils/StyleSheet.ts";

export class FriendAvatarDropdown extends HTMLElement {
  static observedAttributes = ["side"];

  private shadow: ShadowRoot;
  private _user: User;
  private _side: "left" | "right" = "right";

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [styleSheet];
    this._user = { ...guestUser };
    this.render();
  }

  connectedCallback() {
  }

  disconnectedCallback() {
  }

  set user(u: User) {
    this._user = u;
    this.render();
  }

  get user() {
    return this._user;
  }

  attributeChangedCallback(name: string, _oldVal: any, newVal: any) {
    switch (name) {
      case "side":
        if (!(newVal === "left" || newVal === "right"))
          return;
        this._side = newVal;
        this.render();
        break;
      default:
        break;
    }
  }

  render() {
    // console.log(this._user);
    // const imagesrc = safeImageHref(this._user.avatarUrl);
    const avatarSrc = this._user.avatarUrl || "/favicon.ico";
    // console.log("imagesrc", imagesrc, "avatarSrc", avatarSrc);

    this.shadow.innerHTML = `
<span class="flex flex-row hover:bg-base-300 dropdown ${this._side === "right" ? "dropdown-right" : "dropdown-left"}">
  <div id="name_right" class="flex-1 flex flex-col justify-around"></div>
  <div tabindex="0" role="button" id="avatar" 
       class="flex-none btn btn-ghost btn-sm btn-circle avatar 
              ${this._user?.online ? "avatar-online" : "avatar-offline"} 
              focus:bg-base-200 hover:ring-2 focus:ring-2 ring-accent">
    <div class="w-10 rounded-full overflow-hidden">
      <img id="image" alt="Profile" src="${avatarSrc}"/>
    </div>
  </div>
  <div id="name_left" class="flex-1 flex flex-col justify-around"></div>

</span>
`;
    const name_left = this.shadow.querySelector("#name_left")!;
    const name_right = this.shadow.querySelector("#name_right")!;
    name_left.textContent = this._user.name || guestUser.name;
    name_right.textContent = this._user.name || guestUser.name;
    if (this._side === "left") {
      name_left.classList.toggle("hidden", false);
      name_right.classList.toggle("hidden", true);
    } else {
      name_left.classList.toggle("hidden", true);
      name_right.classList.toggle("hidden", false);
    }
  }
}

customElements.define("tr-friendavatar", FriendAvatarDropdown);
