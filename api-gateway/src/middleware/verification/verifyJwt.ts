import * as jose from "jose";

export async function verifyJwt(token: string): Promise<jose.JWTPayload> {
  const JWKS = jose.createRemoteJWKSet(
    new URL("http://authserver:3002/.well-known/jwks.json")
  );
  const { payload } = await jose.jwtVerify(token, JWKS, {
    issuer: "https://authserver",
    audience: "https://api"
  });
  return payload;
}
