import { i18n } from "./i18n.ts";

/**
 * Abstract base class for the Pages loaded in by PageNavigatorClass
 *
 * @prop element The encapsulating HTMLElement.
 * @prop reqAuth True if a jwt token is required to access the page
 */
export default abstract class Page {
  element: HTMLElement;
  reqJWT: boolean = true;
  private languageChangedHandler = () => {
    this.onLanguageChanged();
  };
  /**
  * @param tag The tag type of the encapsulating element used by the page.
  */
  constructor(tag: string = "div") {
    this.element = document.createElement(tag);
  }
  /**
  * Render the html of the page.
  *
  * @example 
  *   // return an html as string
  * async render() {
  *   const html = String.raw;
  *   return html`<h1>Welcome</h1>`;
  * }
  *
  * @example
  *   // set innerHTML of element and return element
  * async render() {
  *   this.innerHTML = `<h1>Welcome</h1>`;
  *   return this.element;
  * }
  */
  async render(): Promise<HTMLElement | string> {
    // Ensure translations are loaded before rendering
    if (!i18n.loaded) {
      await i18n.loadTranslations();
    }
    return this.element;
  }

  /**
  * Function ran after render(), use to attach events or other things.
  */
  async mount() {
    i18n.on('languageChanged', this.languageChangedHandler);
  };

  /**
  * Function ran right before a new page is loaded, use to do general cleanup and remove the events attached in mount().
  */
  unmount() {
    i18n.off('languageChanged', this.languageChangedHandler);

  };

  /**
  * Called when the language changes.
  * Override this method in subclasses to handle language changes.
  * Default behavior: re-render and re-mount the page.
  */
  protected async onLanguageChanged() {
    await this.render();
    await this.mount();
  }
}
