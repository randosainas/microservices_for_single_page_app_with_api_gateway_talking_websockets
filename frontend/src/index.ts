import { PageNavigator, Route } from "./utils/PageNavigator.ts";
import { guestUser, State } from "./utils/State.ts";
import { setupTitleBar } from './utils/setupTitleBar.ts';
import { i18n } from "./utils/i18n.ts";

if (!i18n.loaded) {
  await i18n.loadTranslations();
}

import("./WebComponents/Avatar.ts");
import("./WebComponents/LanguageSwitcher.ts");

// Define routes
// url : view script ts
const routes: Route[] = [
  { url: "404", titlebar: "title.404", view: "NotFound" },
  { url: "/", titlebar: "title.home", view: "home" },
  { url: "/oauth/callback", titlebar: "title.oauthCallback", view: "authCallback" },
  { url: "/play", titlebar: "title.play", view: "play" },
  { url: "/playonline", titlebar: "title.playOnline", view: "playOnline" },
  { url: "/bracket", titlebar: "title.bracket", view: "bracket" },
  { url: "/login", titlebar: "title.login", view: "login" },
  // { url: "/login/create", titlebar: "title.createAccount", view: "create" },
  { url: "/profile", titlebar: "title.profile", view: "profile" },
  { url: "/about", titlebar: "title.about", view: "about" },
  // { url: "/dev", titlebar: "title.devDashboard", view: "dev" },
  // { url: "/dev/ping", titlebar: "title.devPing", view: "ping" },
  // { url: "/dev/game", titlebar: "title.devGame", view: "devGame" },
];

// TODO: add reload page or someting


// HTMLElement our script will manipulate
const app = document.getElementById('app');
if (!app) {
  throw new Error("index.html has no element with id 'app'");
}

State.init(); // async call
PageNavigator.init(app, routes);

setupTitleBar();

// // TODO: get friends list from database.
// State.friends.push({ ...guestUser, name: "Bart", online: true, id: "1" });
// State.friends.push({ ...guestUser, name: "super lange naam of wa is dit lang genoeg", online: true });
// State.friends.push({ ...guestUser, online: true });
// State.friends.push({ ...guestUser, online: true });
// State.friends.push({ ...guestUser, online: true });
// State.friends.push({ ...guestUser });
// State.friends.push({ ...guestUser });
// State.friends.push({ ...guestUser });
// State.friends.push({ ...guestUser });
// State.friends.push({ ...guestUser });


// const jwt = sessionStorage.getItem("jwt");
// if (jwt) {
//   await fetch(`/api/v1/users/${State.user.name}`, {
//     method: "get",
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${jwt}`,
//     }
//   });
// }
// if (jwt) {
//   await fetch(`/api/v1/users/me`, {
//     method: "get",
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${jwt}`,
//     }
//   });
// }
