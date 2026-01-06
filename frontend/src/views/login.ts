import { anchorsAddClicks } from "../utils/PageNavigator.ts";
import Page from "../utils/Page.ts";
import { initGoogleLogin } from "src/utils/googleLogin.ts";
import { i18n } from "src/utils/i18n.ts";

import "../WebComponents/LanguageSwitcher.ts";

export default class Login extends Page {
  constructor() {
    super();
    this.element.id = "login-view";
    this.reqJWT = false;
  }

  async render() {
    super.render();
    this.element.innerHTML = `
<div class="relative flex flex-col text-center items-center">
  <div class="">
    <br/>

    <form id="form" method="dialog">
      <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 group">
        <legend class="fieldset-legend">Login</legend>

        <div class="text-sm my-2">
          ${i18n.t("login.welcome")}
        </div>

        <div class="validator peer/tos mt-1 mb-1">
          <input required type="checkbox" id="input-tos" class="checkbox checkbox-accent checkbox-sm mr-0.5"/>
         ${i18n.t("login.readthe")} <button type="button" onClick="terms_modal.showModal()" class="link">${i18n.t("login.terms")}</button>
        </div>

        <div role="alert" class="alert alert-error alert-soft hidden peer-[&:has(:user-invalid)]/tos:block">
          ${i18n.t("login.accepttermswarning")}
        </div>

        <!-- Google -->
        <button id="login-google" type="submit" class="btn bg-white text-black border-[#e5e5e5]">
          <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
          ${i18n.t("login.google")}
        </button>

      </fieldset>
    </form>

    <dialog id="terms_modal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold">${i18n.t("login.terms")}</h3>
        <p class="py-4">${i18n.t("login.terms.text")}</p>
        <div class="modal-action">
          <form method="dialog"><button class="btn">Close</button></form>
        </div>
      </div>
    </dialog>
  </div>
</div>
`;
    return this.element;
  }

  async mount() {
    super.mount();
    anchorsAddClicks(this.element);

    this.element.querySelector("#login-dev-badjwt")?.addEventListener("click", () => {
      const jwt = 'badJWT';
      sessionStorage.setItem("jwt", jwt);
      history.replaceState({}, "", "/");
      window.dispatchEvent(new Event("popstate"));
    });

    this.element.querySelector("#login-google")?.addEventListener("click", async () => {
      const tosElement = this.element.querySelector("#input-tos") as HTMLInputElement;
      if (!tosElement.checked) {
        return;
      }
      await initGoogleLogin();
    });

  }

  unmount() {
    super.unmount();
  }

}
