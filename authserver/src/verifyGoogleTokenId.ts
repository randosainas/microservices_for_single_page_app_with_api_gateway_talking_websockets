import * as jose from 'jose';
//json object signing and encryption

export interface googleTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  scope: string;
  token_type: string;
  refresh_token?: string;
}

const GOOGLE_ISSUERS = [
  'https://accounts.google.com',
  'accounts.google.com'
];

async function verifyGoogleTokenId(idToken: string, expectedClientId: string) {
  // Fetch Google JWKS (cache in production incase we see latency isseues)
  const JWKS = jose.createRemoteJWKSet(
    new URL('https://www.googleapis.com/oauth2/v3/certs')
  );

  // Verify signature and decode claims
  const { payload } = await jose.jwtVerify(idToken, JWKS, {
    issuer: GOOGLE_ISSUERS,
    audience: expectedClientId
  });

  // Return the decoded payload
  return payload; // contains sub, email, name, picture, etc.
}

export async function handleTokenVerification(googleTokenRes: googleTokenResponse) {
  const tokenId = googleTokenRes.id_token;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId)
    throw new Error("Missing Google client ID");

  try {
    const payload = await verifyGoogleTokenId(tokenId, clientId);
    //       console.log("Verified Google Token Id payload:", payload);
    // {
    //   "iss": "https://accounts.google.com",
    //   "sub": "1234567890",
    //   "email": "user@gmail.com",
    //   "email_verified": true,
    //   "name": "John Doe",
    //   "picture": "https://lh3.googleusercontent.com/...",
    //   "aud": "830281001231-...",
    //   "exp": 1700000000
    // }
    // TODO: discussion needed, we shall somehow use this payload in user data
    /*    const internalJwt = {
          userId: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        };*/
    return { payload }
  }
  catch (error) {
    console.error("Google ID Token  verification failed", error);
    throw new Error("Invalid Google token");
  }
}
