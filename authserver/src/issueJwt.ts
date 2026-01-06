// Using a library from 2014 feels such a risk, how can the
// open source old influencialt libraries be kept from being taken over
import * as jose from 'jose';
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import { userManagerUser } from './typeUser';

// Issue an internal json web token
//TODO: type any, generic types is not a good practice
export async function issueJwt(id: number, googlePayload: any) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const privateKeyPem = fs.readFileSync(path.join(__dirname, "../certs/private.pem"), "utf8");
  const privateKey = await jose.importPKCS8(privateKeyPem, "RS256");

  const jwt = await new jose.SignJWT({
    // user: user, // use internal unique user
	id: id,
    email: googlePayload.payload.email,
    iat: Math.floor(Date.now() / 1000),
  })
    .setProtectedHeader({ alg: "RS256", kid: "authserver-1" }) // kid matches JWKS entry
    .setIssuer("https://authserver")
    //token meant for so here one could have different purposes designed
    // api.game api.payments
    .setAudience("https://api")
    .setExpirationTime("2h")
    .sign(privateKey);
  return jwt;
}

