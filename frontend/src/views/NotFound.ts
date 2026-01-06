import { i18n } from "src/utils/i18n.ts";
import Page from "../utils/Page.ts";

export default class Home extends Page {
  constructor() {
    super();
    this.element.id = "notfound-view";
    this.reqJWT = false;
  }

  async render() {
    this.element.innerHTML = `
    <div class="relative flex flex-col text-center items-center">
      <div class="">
        <h1 class="p-4 md:p-8 underline text-4xl md:text-6xl">404 Not Found</h1>
        <div>
          ${i18n.t("404.text")}
        </div>
      </div>
    </div>
    `;
    return this.element;
  }
}
