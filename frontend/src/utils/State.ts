import Page from "./Page.ts";
import { Route } from "./PageNavigator.ts";

/**
 * User type
 *
 * @prop name Name of the user
 * @prop avatarUrl Url to fetch the user's profile picture from
 * @prop isGuest Is the user a guest or not?
 */
export type User = {
  name: string;
  avatarUrl: string;
  isGuest: boolean;
  online?: boolean;
  id?: string | null; // TODO KOBE?
  friends?: User[]; // TODO KOBE?
};

/**
 * readonly const User, used for guest users
 */
export const guestUser: Readonly<User> = {
  name: "Guest",
  // avatarUrl: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
  avatarUrl: "favicon.ico",
  isGuest: true
};

/** Type union of accepted owners in the StateClass listeners list */
type ListenOwner = HTMLElement | Page;
/**
 * Listener type used in the StateClass listeners list
 *
 * @prop event Property of State to listen for, callback on change or emit
 * @prop callback Function to run on event
 * @prop owner Optional: Owner of the listener event, used for neater cleanup
 */
type Listener = {
  event: keyof StateClass;
  callback: () => void;
  owner?: ListenOwner;
}

/**
 * Class to handle a globaly available State.
 *
 * Listeners can subscribe for changes of the public properties to run a callback function.
 * For easy cleanup, pass owner to listener and disconnect with disconnectListeners(owner).
 *
 * @prop user The current user
 * @prop route The current route
 * @prop players Array of User objects, used for the local 1v1 and tournament game setup
 */
export class StateClass {
  private static _instance: StateClass;
  private listeners: Listener[] = [];

  user: User = { ...guestUser };
  route: Route = { url: "", view: "", titlebar: "" };
  players: User[] = [];
  friends: User[] = [];

  private constructor() { }

  /**
  * @returns returns a new instance of the class or an already existing one.
  */
  static get instance() {
    return this._instance ??= new StateClass();
  }

  async init() {
    const jwt = sessionStorage.getItem("jwt");
    const user = sessionStorage.getItem("user");
    if (!jwt || !user) {
      return;
    }
    this.user = JSON.parse(user);
  }

  /**
  * Call this function to manually fire off an event.
  */
  emitEvent(event: keyof StateClass) {
    this.notifyListeners(event);
  }

  /**
  * Set the State.user and fire of "user" event.
  *
  * @param u A Deep copy is made, not a reference assignment
  */
  setUser(u: User) {
    this.user = { ...u };
    sessionStorage.setItem("user", JSON.stringify(this.user));
    this.notifyListeners("user");
  }

  /**
  * Set the State.route and fire of "route" event.
  *
  * @param r A Deep copy is made, not a reference assignment
  */
  setRoute(r: Route) {
    this.route = { ...r };
    this.notifyListeners("route");
  }

  /**
  * Add a user to the State.players and fire of "players" event.
  *
  * @param u Reference of the object is pushed
  */
  addPlayer(u: User) {
    this.players.push(u);
    this.notifyListeners("players");
  }

  /**
  * Remove a user from the State.players and fire of "players" event on success.
  *
  * @param u Reference of the object is searched and removed
  */
  removePlayer(u: User) {
    const index = this.players.indexOf(u, 0);
    if (index === -1) return;
    this.players.splice(index, 1);
    this.notifyListeners("players");
  }

  /**
  * Clear State.players and fire of "players" event.
  */
  clearPlayers() {
    this.players = [];
    this.notifyListeners("players");
  }

  /**
  * Add a listener for an event.
  *
  * @param event On what StateClass key to listen for
  * @param callback function to run on event
  * @param owner Optional: Pass an owner identifier for easy cleanup
  *
  * @returns Returns a function to call to unregister the listener.
  */
  addListener(event: keyof StateClass, callback: () => void, owner?: ListenOwner): () => void {
    const listener: Listener = { event, callback, owner };
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    }
  }

  /**
  * Remove all the listeners associated with an owner identifier.
  */
  disconnectListeners(owner: ListenOwner) {
    this.listeners = this.listeners.filter((l) => l.owner !== owner);
  }

  /**
  * Run all the callback functions for the listeners with matching event.
  */
  private notifyListeners(event: keyof StateClass) {
    for (const listener of this.listeners) {
      const forEvent = listener.event;
      if (forEvent === event) {
        listener.callback();
      }
    }
  }
  // in case time, discussion of error handling, to add a non-blocking visual notification
  //i.e a toast, a div element.
  notify(message: string, logout: boolean = false) {
    alert(message);
    if (logout) {
      sessionStorage.clear();
      history.replaceState({}, "", "/login");
      window.dispatchEvent(new Event("popstate"));
    }
  }
}

/**
 * Export the StateClass instance for global project use.
 * 
 * @see {@link StateClass}
 *
 * @example
 * import { State } from "State.ts";
 *
 *  // Listen for route change, updating the titleBar
 * const titleBar = document.getElementById('titlebar');
 * if (titleBar) {
 *   State.addListener(
 *     "route",
 *     () => titleBar.textContent = State.route.titlebar
 *   );
 * }
 *
 */
export const State = StateClass.instance;
