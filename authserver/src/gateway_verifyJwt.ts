import * as jose from "jose";

export async function verifyJwt(token: string) {
  const JWKS = jose.createRemoteJWKSet(
    new URL("https://localhost:443/.well-known/jwks.json")
  );
  const { payload } = await jose.jwtVerify(token, JWKS, {
    issuer: "https://authserver",
    audience: "https://api"
  });
  return payload;
}
