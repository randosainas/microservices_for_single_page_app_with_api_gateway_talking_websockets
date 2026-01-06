import { State } from "../utils/State.ts";
import Page from "../utils/Page.ts";
import { i18n } from "src/utils/i18n.ts";
import "../WebComponents/LanguageSwitcher.ts";

export default class Home extends Page {

  constructor() {
    super();
    this.element.id = "home-view";
    this.reqJWT = false;
  }

  async render() {
    super.render();
    this.element.innerHTML = `
    <div class="flex justify-center items-center min-h-screen px-4">
      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 max-w-2xl text-center">
        ${i18n.t("aboutPage.content")}
      </div>
    </div>
    `;
    return this.element;
  }

}
