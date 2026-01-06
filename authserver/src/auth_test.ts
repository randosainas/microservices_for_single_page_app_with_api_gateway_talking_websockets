import crypto from 'node:crypto';

// PKCE Proof Key for Code Exchange, a safey belt for OAuth
// it is flow for SPA since it cannot keep secrets.
export function makePkceObj() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  //take and huge 0 initialized array, fill it.
  // uint8Array is a an array of 8-bit unsigned integers
  // Random values in crypto API gives me cryptographically random values
  // meaning high entropy = many brute force guesses would you need.
  // 32 bytes is 256bits i.e 2 to the power of 256, i.e 1.16E77, cool
  const verifier = toBase64URL(bytes);
  //create returns a hash object
  //update a hash class method with the base64url string
  //finalize hash object get string, cannot call update() on it no more.
  //make the string url-safe
  const challenge = toBase64URL(crypto.createHash('sha256').update(verifier).digest());
  return { verifier, challenge }//just because I can return multiple via an object
}

function toBase64URL(bytes: Uint8Array): string {
  //encode the array to a binary string 
  // 
  const base64 = btoa(String.fromCharCode(...bytes));
  //returns a new string on each replace, use a /g global flag to match all
  //JS world likes immutable strings, V8 engine is optimized for that.
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
