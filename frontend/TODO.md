# Frontend TODO

Things that have to be done, and I can think of right now.

## Style

This can be done a bit along the way, without going too overboard. It already looks a lot better without much work by using TailwindCSS and the DaisyUI plugin. Only trouble is not knowing all the html stuff right away.

## Navbar:

- [ ] Links to correct pages not many make sense in navbar (easy to do) [Pages](#pages)
- [ ] **Avatar dropdown**:
  - [x] Change depending on login state (guest user)
  - [ ] Fetch and use avatar icon from database, or Guest icon.
  - [x] Create pages and links -> [Pages](#pages)

## Pages

- [x] **Dashboard**:
  Show a couple of navigation buttons directing to mainly used pages: play 1v1, play tournament

- [ ] **Login (Avatar dropdown)**:
  - [x] Page or as a modal (floating window)
  - [x] Input fields for name and password -> Validate partly here, actual login checks in backend?
  - [x] -OR- List of OAuth's we have (google, github, 42Network). -> Fetch/communicate with auth microservice.
  - [x] Button to go to create a new account -> different page
  - [ ] Communicate with backend 

- [ ] **User management A.K.A. Profile page?**:
These things make way more sense in an online setting. Doing this without the online module feels a bit weird.
  - [ ] Fiends:
    - [ ] API calls
    - [ ] Show friends, online and offline Status
    - [ ] Add friend -> On unique nickname or some unique ID
    - [ ] Delete friend
  - [ ] Change Avatar picture:
    - [ ] API calls.
    - [ ] input for file (or web link?)
    - [ ] Button to reset to our default that is given when account is created.
    - [ ] Check for dimensions and file size. (what limit?)
  - [ ] Delete account -> Read GDPR and comply
    - [ ] API calls
  - [ ] Change nickname?:
    - [ ] API call
    - [ ] Again do checks in backend to see if it is unique
  - [ ] Change Password -> Input old, input new, all the checks etc.
  - [ ] Match history:
    - [ ] Stats like wins losses (W/L ratio) etc.
    - [ ] API call -> fetch from database.
    - [ ] Only for logged in users.
    - [ ] Games played with details like when, against who etc.
    - [ ] Separate listing for tournaments.

- [ ] **Footer**:
  - [ ] Show cookie dialog.
  - [ ] Link to about page?
  - [ ] Link to Terms of Service
  - [ ] Link to cookie settings

- [ ] **Create account (from Login?)**:
  - [ ] API calls
  - [x] Input fields for name password (and other things?)
  - [?] Button to continue without account and staying a guest (-> dashboard or last page not login?)

- [ ] **Local 1v1**:
  - [x] Show a game or settings for the game
    - [ ] player names?
    - [ ] score needed for win
    - [ ] handicap rules? give one player starting points
    - [ ] could do extra settings like paddle/ball speed
  - [x] confirm start button.
  - [ ] Run client side game logic and communicate with backend
  - [ ] update view of game, client predict checking with server updates
  - [ ] Depending on settings, show winner.

- [ ] **Local tournament**:
  - [x] UI to add and view players
  - [-] Generate bracket (button, or on tourny start)
  - [ ] Start the tournamment, set some rules (score needed for a win?)
  - [ ] Show a game with the two queued players and ask confirm start button.
  - [ ] Run client side game logic and communicate with backend
  - [ ] update view of game, client predict checking with server updates
  - [ ] Depending on settings, show winner. Confirm to set up next game and (show bracket?).
  - [ ] After all games are done, show Winner and bracket.

- [ ] **Site Settings (low priority)**:
  - [ ] Store in client's browser's "localStorage".
  - [ ] Theme (color, light/dark -> [daisyUI](https://daisyui.com/docs/themes/))

## Other

- [x] Detach all listeners when unmounting Page/detaching HTMLElement
  - maybe streamline it to be similar between both PageNavigator and the State classes
- [ ] Nicer favicon.ico and different sizes.
- [ ] reactive according to size of the window.
