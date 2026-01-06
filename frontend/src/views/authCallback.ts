import { State } from "../utils/State.ts";
import { PageNavigator } from "../utils/PageNavigator.ts";
import Page from "src/utils/Page.ts";

export default class AuthCallbackPage extends Page {
  constructor() {
    super();
    this.reqJWT = false;
  }

  async render(): Promise<HTMLElement> {
    this.element.innerHTML = "<p>Signing you in...</p>";
    return this.element;
  }

  async mount() {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");
      const expectedState = params.get("state");
      // TODO: Can this sessionStorage oauth_state be used for attacks? Everything frontend is visible for users
      const state = sessionStorage.getItem("oauth_state");

      if (error) {
        PageNavigator.goTo("/login");
        return;
      }
      if (!code || !state || !expectedState || state !== expectedState) {
        console.error("Invalid OAuth response, possible CSRF");
        PageNavigator.goTo("/login");
        return;
      }
      // call to backend
      const resp = await fetch("/api/auth/exchange_google_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, state }),
      });
      if (!resp.ok) {
        console.error("Login failed:", await resp.text());
        State.notify("Failed to sign you in. Try again.", true);
        return;
      }

      const data = await resp.json();
      const token = data.token;
      // TODO: jwt is currently unused unstored 
      // Store JWT token in sessionStorage for authenticated requests
      sessionStorage.setItem("jwt", token);
      try {
        State.setUser({ ...data.user, isGuest: false });
        //remove senstives from the URL
        history.replaceState({}, "", "/");
        //force router tp load the route
        window.dispatchEvent(new Event("popstate"));
      }
      catch (error) {
        console.error("Post-login navigation error", error);
        PageNavigator.goTo("/login");
      }
    } catch (err) {
      console.error("OAuth callback error:", err);
      PageNavigator.goTo("/login");
    }
  }

  unmount() { }
}
