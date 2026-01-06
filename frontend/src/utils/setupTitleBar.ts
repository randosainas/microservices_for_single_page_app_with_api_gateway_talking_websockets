import { State } from './State.ts';
import { i18n } from "./i18n.ts";

export function setupTitleBar() {
  const titleBar = document.getElementById('titlebar');
  if (titleBar) {
    State.addListener(
      "route",
      () => {
        titleBar.textContent = i18n.t(State.route.titlebar || "title.404");
      });
    i18n.on('languageChanged', () => {
      titleBar.textContent = i18n.t(State.route.titlebar || "title.404");
    });
  }
}
