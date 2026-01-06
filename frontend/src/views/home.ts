import { anchorsAddClicks } from "../utils/PageNavigator.ts";
import Page from "../utils/Page.ts";
import "../WebComponents/LanguageSwitcher.ts"; // TODO KOBE ? how to solve this import?
import { i18n } from "src/utils/i18n.ts";

export default class Home extends Page {

  constructor() {
    super();
    this.element.id = "home-view";
  }

  async render() {
    super.render();
    this.element.innerHTML = `
    <div class="relative flex flex-col text-center items-center">
      
      <div class="">
        <!-- <a data-link href="/"> -->
          <h1 class="p-4 md:p-8 underline text-4xl md:text-6xl">${i18n.t('home.title')}</h1>
        <!-- </a> -->
      </div>
      
      <div class="text-2xl md:text-4xl pb-2">${i18n.t('home.localPlay')}</div>
      <div class="flex flex-col justify-evenly gap-2">
        <a data-link href="/play" class="btn btn-primary md:text-2xl">
          ${i18n.t('home.1v1')}
        </a>
        <a data-link href="/bracket" class="btn btn-primary md:text-2xl">
          ${i18n.t('home.bracket')}
        </a>
      </div>

      <div class="divider"></div>
      <div class="text-2xl md:text-4xl pb-2">${i18n.t('home.onlinePlay')}</div>
      <div class="flex flex-col justify-evenly gap-2">
        <a data-link href="/playonline" class="btn btn-primary md:text-2xl">
          ${i18n.t('home.1v1')}
        </a>
      </div>

      <!-- TODO: Remove later or make only visible in dev -->
      <!-- <div class="divider"></div> -->
      <!-- <div class="text-2xl md:text-4xl pb-2">${i18n.t('home.dev')}</div> -->
      <!-- <div class="flex flex-col justify-evenly gap-2"> -->
      <!--   <a data-link href="/dev" class="btn btn-primary md:text-2xl"> -->
      <!--     ${i18n.t('home.devDashboard')} -->
      <!--   </a> -->
      <!--   <a data-link href="/dev/ping" class="btn btn-primary md:text-2xl"> -->
      <!--     ${i18n.t('home.devPing')} -->
      <!--   </a> -->
      <!--   <a data-link href="/dev/game" class="btn btn-primary md:text-2xl"> -->
      <!--     ${i18n.t('home.devGame')} -->
      <!--   </a> -->
      <!-- </div> -->
      <!-- Until here -->

    </div>
    `;
    return this.element;
  }


  async mount() {
    super.mount();
    anchorsAddClicks(this.element);
  }

  unmount() {
    super.unmount();
  }
}
