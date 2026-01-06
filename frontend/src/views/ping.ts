import { State } from "src/utils/State.ts";
import Page from "../utils/Page.ts";

export default class Ping extends Page {
  constructor() {
    super();
    this.element.id = "ping-view";
  }

  async render() {
    this.element.className = "text-center";
    this.element.innerHTML = `
<h1 id="ping1" class="p-4 md:p-8 text-2xl md:text-6xl">Waiting for backend...</h1>
<h1 id="ping2" class="p-4 md:p-8 text-2xl md:text-6xl">Waiting for backend...</h1>
<h1 id="ping3" class="p-4 md:p-8 text-2xl md:text-6xl">Waiting for backend...</h1>
<h1 id="ping4" class="p-4 md:p-8 text-2xl md:text-6xl">Waiting for backend...</h1>
<!-- <h1 id="ping5" class="p-4 md:p-8 text-2xl md:text-6xl">Waiting for backend...</h1> -->
<!-- <h1 id="ping6" class="p-4 md:p-8 text-2xl md:text-6xl">Waiting for backend...</h1> -->
<div class="mt-2">
  <button class="btn btn-secondary" id="back">Back</button>
</div>`;
    return this.element;
  };

  async mount() {
    document.querySelector('#back')?.addEventListener('click', () => {
      history.back();
    });

    const ping1 = document.querySelector('#ping1')!;
    const ping2 = document.querySelector('#ping2')!;
    const ping3 = document.querySelector('#ping3')!;
    const ping4 = document.querySelector('#ping4')!;
    // const ping5 = document.querySelector('#ping5')!;
    // const ping6 = document.querySelector('#ping6')!;

    try {

      const jwt = sessionStorage.getItem("jwt");
      if (!jwt) {
        ping1.textContent = "Please log in first";
        ping2.textContent = "Please log in first";
        ping3.textContent = "Please log in first";
        ping4.textContent = "Please log in first";
        // ping5.textContent = "Please log in first";
        // ping6.textContent = "Please log in first";
        console.warn("Missing login");
        return;
      }

      // Testing ping through the test route.
      const pingResponse = await fetch('/api/v1/test', {
        method: "get",
        headers: { "Authorization": `Bearer ${jwt}` },
      });

		//     const userSetResponse = await fetch('/api/v1/users', {
		//       method: "post",
		//       headers: {
		//         'Content-Type': 'application/json',
		//         'Authorization': `Bearer ${jwt}`,
		//       },
		// body: JSON.stringify({ username: "yannick" })
		//     });
      // Testing the getUser method through the test route.
      const userGetResponse1 = await fetch(`/api/v1/users/me`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          'Cache-Control': 'no-cache',
        }
      });
      const userUpdateResponse = await fetch(`/api/v1/users/patchme`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
		body: JSON.stringify({ username: "josef" })
      });
      const userGetResponse2 = await fetch('/api/v1/users/me', {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          'Cache-Control': 'no-cache',
        }
      });
      // const userDelResponse = await fetch(`/api/v1/users/deleteme`, {
      //   method: "DELETE",
      //   headers: {
      //     'Authorization': `Bearer ${jwt}`,
      //   }
      // });
      // const userGetResponse3 = await fetch('/api/v1/users/me', {
      //   method: "GET",
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${jwt}`,
      //   }
      // });

      // if (!ping_response.ok) {
      //   throw new Error(`Response status: ${ping_response.status}`);
      // }

      const resPing = await pingResponse.json();
      const pingText = "Ping: " + resPing.message;
      ping1.textContent = pingText;

      const resGetUser1 = await userGetResponse1.json();
      ping2.textContent = "Got user: " + resGetUser1.message + " "
        + JSON.stringify(resGetUser1.user);

      const resPatchUser = await userUpdateResponse.json();
      ping3.textContent = "Updated user: " + resPatchUser.message + " "
        + JSON.stringify(resPatchUser.user);

      const resGetUser2 = await userGetResponse2.json();
      ping4.textContent = "Got user: " + resGetUser2.message + " "
        + JSON.stringify(resGetUser2.user);

      // const resDelUser = await userDelResponse.json();
      // ping5.textContent = "Deleted user: " + resDelUser.message + " "
        // + JSON.stringify(resDelUser.user);

      // const resGetUser3 = await userGetResponse3.json();
      // ping6.textContent = "Got user: " + resGetUser3.message + " "
      //   + JSON.stringify(resGetUser2.user);
      //
    } catch (error) {
      if (error instanceof Error) {
        alert("Error: " + error.message);
        ping1.textContent = "Test waiting for backend";
        ping2.textContent = "Get user waiting for backend";
        ping3.textContent = "Update user waiting for backend";
        ping4.textContent = "Get user waiting for backend";
        // ping5.textContent = "Delete user waiting for backend";
        // ping6.textContent = "Get user waiting for backend";
      }
    }
  }
}
