import * as jose from "jose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load public key
const publicPem = fs.readFileSync(path.join(__dirname, "../certs/public.pem"), "utf8");

// Convert to a JWK
const publicKey = await jose.importSPKI(publicPem, "RS256");
const jwk = await jose.exportJWK(publicKey);

// Add a key ID (kid) so verifiers know which key signed which token
jwk.kid = "authserver-1";

export const internalJWKS = { keys: [jwk] };
