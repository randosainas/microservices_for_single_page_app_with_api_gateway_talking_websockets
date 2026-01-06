import { guestUser, State } from "../utils/State.ts";
import Page from "../utils/Page.ts";

export default class Home extends Page {
  constructor() {
    super();
    this.element.id = "login-view";
  }

  async render() {
    this.element.innerHTML = `
<div class="relative flex flex-col text-center items-center">
  <div class="">
    <br/>

    <form id="form" method="dialog">
      <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 group">
        <legend class="fieldset-legend">Create Account</legend>

        <label class="input validator peer/nickname">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
            <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clip-rule="evenodd" />
          </svg>

          <input id="input-nickname" type="text" required minlength="3" pattern="^[a-zA-Z][a-zA-Z0-9_]{2,}$" placeholder="Nickname" />
        </label>

        <label class="input validator peer/email">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
            <path fill-rule="evenodd" d="M5.404 14.596A6.5 6.5 0 1 1 16.5 10a1.25 1.25 0 0 1-2.5 0 4 4 0 1 0-.571 2.06A2.75 2.75 0 0 0 18 10a8 8 0 1 0-2.343 5.657.75.75 0 0 0-1.06-1.06 6.5 6.5 0 0 1-9.193 0ZM10 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" clip-rule="evenodd" />
          </svg>

          <input id="input-email" required type="email" placeholder="Email" />
        </label>

        <label class="input validator peer/password">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
            <path fill-rule="evenodd" d="M8 7a5 5 0 1 1 3.61 4.804l-1.903 1.903A1 1 0 0 1 9 14H8v1a1 1 0 0 1-1 1H6v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 .293-.707L8.196 8.39A5.002 5.002 0 0 1 8 7Zm5-3a.75.75 0 0 0 0 1.5A1.5 1.5 0 0 1 14.5 7 .75.75 0 0 0 16 7a3 3 0 0 0-3-3Z" clip-rule="evenodd" />
          </svg>

          <input id="input-password" class="grow" type="password" required minlength="8" pattern="^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*[\\s]).{8,}$" placeholder="Password" />

          <div id="toggle-password" class="swap">
            <div class="swap-on">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="swap-off">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                <path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clip-rule="evenodd" />
                <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
              </svg>
            </div>
          </div>
        </label>

        <div class="validator peer/tos mt-1 mb-1">
          <input required type="checkbox" id="input-tos" class="checkbox checkbox-accent checkbox-sm mr-0.5"/>
          I have read <button type="button" onClick="terms_modal.showModal()" class="link">blah blah blah...</button>
        </div>

        <div role="alert" class="alert alert-error alert-soft hidden peer-[&:has(:user-invalid)]/nickname:block">
          Nickname must start with non-digit<br/>
          minimum 3 characters<br/>
          alphanumeric and '_' allowed
        </div>

        <div role="alert" class="alert alert-error alert-soft hidden peer-[&:has(:user-invalid)]/email:block">
          Email must be a valid email
        </div>

        <div role="alert" class="alert alert-error alert-soft hidden peer-[&:has(:user-invalid)]/password:block">
          Must be more than 8 characters, with
          <br />At least one number <br />At least one lowercase letter <br />At least one uppercase letter <br />At least one special character<br />No white space
        </div>

        <div role="alert" class="alert alert-error alert-soft hidden peer-[&:has(:user-invalid)]/tos:block">
          Read ToS and click the checkbox bruh
        </div>

        <button id="login-create" type="submit" class="btn btn-neutral outline-accent mt-4">Create Login</button>

      </fieldset>
    </form>

    <dialog id="terms_modal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Terms Of Service</h3>
        <p class="py-4">Just have fun!</p>
        <div class="modal-action">
          <form method="dialog"><button class="btn">Close</button></form>
        </div>
      </div>
    </dialog>
  </div>
</div>
`;
    return this.element;
  }

  async mount() {
    this.element.querySelector("#login-dev-quick")?.addEventListener("click", () => {
      State.setUser({ ...guestUser, isGuest: false });
    });

    const form = this.element.querySelector("#form") as HTMLFieldSetElement;
    const nicknameElement = form.querySelector("#input-nickname") as HTMLInputElement;
    const emailElement = form.querySelector("#input-email") as HTMLInputElement;
    const passwordElement = form.querySelector("#input-password") as HTMLInputElement;
    const tosElement = form.querySelector("#input-tos") as HTMLInputElement;
    const togglePasswordElement = form.querySelector("#toggle-password");

    togglePasswordElement?.addEventListener("click", () => {
      togglePasswordElement.classList.toggle("swap-active");
      passwordElement.type = passwordElement.type === "password" ? "text" : "password";
    })

    if (!form || !emailElement || !passwordElement || !nicknameElement || !tosElement) {
      throw new Error("Bad HTML");
    }

    this.element.querySelector("#login-create")?.addEventListener("click", () => {
      if (
        nicknameElement.validity.valid &&
        emailElement.validity.valid &&
        passwordElement.validity.valid &&
        tosElement.checked) {
        State.setUser({ ...guestUser, name: nicknameElement.value, isGuest: false });
      }
    });
  }

  unmount() {
  }

}
