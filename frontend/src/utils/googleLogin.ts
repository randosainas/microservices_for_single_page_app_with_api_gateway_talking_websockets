export async function initGoogleLogin() {
  try {
    // Start the OAuth 2.0 login flow.
    // Redirect the user to the authorization server
    // with initial info, wait for them to log in,
    // and then the auth server redirects them back to our
    // SPA with an authorization code."
    const state = crypto.randomUUID();
    // TODO: Can this sessionStorage oauth_state be used for attacks? Everything frontend is visible for users
    sessionStorage.setItem('oauth_state', state);
    //browser can store this. store in verifier in session
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    const params = {
      // google gives us a OAuth service id this client id
      client_id: '830281001231-vd571lc276keja90dpih9kjan5kanukk.apps.googleusercontent.com',
      // in case the login is successful, send the request to the auth server.
      redirect_uri: `${window.location.origin}/oauth/callback`,
      //short-lived authorization code, will be exchanged for token shortly
      response_type: 'code',
      //so we can use token in backend later to read user email, name and picture
      scope: 'openid email profile',
      //to check the google respose has the same state
      state,
      //player must choose a google account
      prompt: 'select_account',
    };
    authUrl.search = new URLSearchParams(params).toString();
    //a full redirect to google
    window.location.href = authUrl.toString();
  }
  catch (err) {
    console.error("Google login init error:", err);
  }
}
