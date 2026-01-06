import { anchorsAddClicks, PageNavigator, updateInnerHTML } from "../utils/PageNavigator.ts";
import { initGoogleLogin } from "../utils/googleLogin.ts";
import { guestUser, State } from "../utils/State.ts";
import { styleSheet } from "../utils/StyleSheet.ts";
import { i18n } from "src/utils/i18n.ts";


export class AvatarDropdown extends HTMLElement {
  static observedAttributes = [];

  private shadow: ShadowRoot;
  private imageElement: HTMLImageElement;
  private loginElement: HTMLElement;
  private profileElement: HTMLElement;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [styleSheet];
    this.render();

    const imageElementTemp = this.shadow.querySelector("#image");
    const loginElementTemp = this.shadow.querySelector("#login-btn");
    const profileElementTemp = this.shadow.querySelector("#profile-btn");
    if (!imageElementTemp || !loginElementTemp) {
      throw new Error("Bad Web Component");
    }

    this.imageElement = imageElementTemp as HTMLImageElement;
    this.loginElement = loginElementTemp as HTMLElement;
    this.profileElement = profileElementTemp as HTMLElement;

    State.addListener(
      "user",
      () => this.update(),
      this
    )
  }

  connectedCallback() {
    anchorsAddClicks(this.shadow);
    this.loginElement.addEventListener("click", this.loginClick);

    this.update();
    i18n.on('languageChanged', () => this.render());
  }
  
  disconnectedCallback() {
    State.disconnectListeners(this);
    i18n.off('languageChanged', () => this.render());
  }

  attributeChangedCallback(name: string, _oldVal: any, _newVal: any) {
    switch (name) {
      default:
        break;
    }
  }

  render() {
    this.shadow.innerHTML = `
<div class="dropdown dropdown-end group">
  <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar group-focus-within:bg-base-200 group-focus-within:ring-2 focus:bg-base-200 hover:ring-2 focus:ring-2 ring-accent">
    <div class="w-10 rounded-full">
      <img id="image" alt="Profile" src="/favicon.ico">
    </div>
  </div>
  <ul class="menu menu-sm dropdown-content bg-base-200 rounded-box z-1 mt-3 p-2 w-30 shadow text-xl md:text-sm not-dark:text-black">
    <li id="profile-btn"><a class="" onClick="this.blur()" href="/profile">${i18n.t("profile")}</a></li>
    <li><a class="" onClick="this.blur()" href="/about">${i18n.t("about")}</a></li>
    <li>
      <button id="login-btn" onClick="this.blur()">${i18n.t("logout")}</button>
    </li>
  </ul>
</div>`};

  update() {
    this.loginElement.classList.toggle("hidden", sessionStorage.getItem("jwt") == null);
    this.profileElement.classList.toggle("hidden", sessionStorage.getItem("jwt") == null);

    // this.loginElement.textContent = State.user.isGuest ? i18n.t("login") : i18n.t("logout");
    this.imageElement.src = State.user.isGuest ? "/favicon.ico" : State.user.avatarUrl;
  }

  loginClick = async () => {
    if (!this.loginElement)
      return;
    if (!State.user.isGuest) {
      this.logoutUser();
    }
  }

  logoutUser() {
    sessionStorage.clear();
    // TODO: Clear user PI (personal information)
    /*  State.setUser({
        name: "",
        email: "",
        picture: "",
        isGuest: true
      });*/

    // TODO: clear any tokens etc you stored in session
    //  sessionStorage.removeItem("state");
    // localStorage.removeItem("auth_token");

    window.location.replace("/");
  }
}

customElements.define("tr-avatar", AvatarDropdown);
