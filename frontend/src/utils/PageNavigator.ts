import Page from "./Page.ts";
import { State } from "./State.ts";

/**
 * @prop url Location in the site url. example: "/login"
 * @prop view File to load in as view, expected to be of type {@link Page}
 * @prop titlebar Text to be displayed in the navbar
 */
export interface Route {
  url: string;
  view: string;
  titlebar: string;
};

/**
 * Goes over all the 'a' tags in {@link element} and attaches a 'click'
 * event listener. The default anchor click is disabled and the href atribute
 * is used as argument for {@link PageNavigatorClass.goTo}
 *
 * @param element Element to query for anchor links
 */
export function anchorsAddClicks(element: HTMLElement | Document | ShadowRoot) {
  const nav = PageNavigatorClass.instance;

  const anchors = element.querySelectorAll("a");
  anchors.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const href = (a as HTMLAnchorElement).getAttribute("href");
      if (href) {
        nav.goTo(href);
      }
    });
  });
}

/**
 * Helper function to update the innerHTML of an HTMLElement to the
 * input HTMLElement or string.
 *
 * @param parent The parent element to update the innerHTML of.
 * @param content The value for the innerHTML.
 */
export function updateInnerHTML(parent: HTMLElement, content: HTMLElement | string) {
  if (content instanceof HTMLElement) {
    parent.innerHTML = "";
    parent.appendChild(content);
  } else if (typeof content === "string") {
    parent.innerHTML = content;
  }
}

/**
 * Class to encapsulate all handling of the single-page routing.
 *
 */
export class PageNavigatorClass {
  private static _instance: PageNavigatorClass;
  private container: HTMLElement | null = null;
  private routes: Map<string, Route> = new Map();
  private prevPage: Page | null = null;

  private constructor() {
  }

  /**
  * @returns returns a new instance of the class or an already existing one.
  */
  static get instance(): PageNavigatorClass {
    return this._instance ??= new PageNavigatorClass();
  }

  /**
  * Initialize the instance, should only be called once. Sets the two params as
  * private members. Attaches 'popstate' listener to the window with callback
  * to PageNavigatorClass.loadRoute with the location pathname. Makes a
  * call to {@link anchorsAddClicks} on the document. Finally, loads the
  * current location pathname;
  *
  * @param container HTMLElement to load the page views to
  * @param routes An array of {@link Route} to be handled by the PageNavigatorClass instance
  */
  init(container: HTMLElement, routes: Route[]) {

    this.container = container;
    for (const r of routes) {
      this.routes.set(r.url, r);
    }

    window.addEventListener("popstate", () => {
      const route = location.pathname;
      if (route) {
        this.loadRoute(route);
      }
    });
    anchorsAddClicks(document);
    this.loadRoute(location.pathname);
  }

  /**
  * Add a route to the registered map of routes to be handled by the
  * PageNavigatorClass instance.
  *
  * @param route The route to add.
  */
  addRoute(route: Route) {
    this.routes.set(route.url, route);
  }

  /**
  * Load a new page view and pushes the state to the history webAPI. First
  * checks the location pathname returning if we are already on the route
  * requested.
  *
  * @param url
  */
  async goTo(url: Route["url"]) {
    if (location.pathname !== url) {
      history.pushState({}, '', url);
      await this.loadRoute(url);
    }
  }

  /**
  * Load a new page view. Dynamically imports the {@link Page} file.
  * Then unmounts the previous page, loads the new page's html into the
  * container and runs mount on the new page.
  */
  private async loadRoute(url: Route["url"]) {
    if (!this.container) return;

    const route = this.routes.get(url) || this.routes.get("404") || undefined;
    if (!route) {
      return;
    }

    // this.container.innerHTML = "Loading...";

    try {
      const { default: Page } = await import(`../views/${route.view}.ts`);
      const page = new Page({ navigator: this }) as Page;

      if (page.reqJWT) {
        const jwt = sessionStorage.getItem("jwt");
        if (!jwt) {
          // Could be some 401 page or something?
          console.warn("Missing login");
          history.replaceState({}, "", "/login");
          this.loadRoute("/login");
          return;
        }
      }

      this.prevPage?.unmount();
      this.prevPage = null; // Set to null in case content await errors.

      State.setRoute(route);
      const content = await page.render();
      updateInnerHTML(this.container, content);
      this.prevPage = page;
      await page.mount();
    } catch (error) {
      console.error(`Page not found because ${error}`);
      this.container.innerHTML = `<h1>404 - Page Not Found</h1>`;
    }
  }
}

/**
 * Export the PageNavigatorClass instance for global project use.
 * 
 * @see {@link PageNavigatorClass}
 *
 * @example
 * import { PageNavigator, Route } from "PageNavigator.ts";
 *
 * const app = document.getElementById('app')!;
 * const routes: Route[] = [
 *  { url: "/", titlebar: "Home", view: "home" },
 * ]
 *
 * PageNavigator.init(app, routes);
 */
export const PageNavigator = PageNavigatorClass.instance;
