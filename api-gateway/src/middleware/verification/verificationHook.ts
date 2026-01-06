import { FastifyReply, FastifyRequest } from "fastify";
import { verifyJwt } from "./verifyJwt";

// Parse the headers for Authorization string and verify token
export async function verificationHook(
  request: FastifyRequest,
  reply: FastifyReply) {
  // Skip authentication for specific routes (public endpoints)
  const publicRoutes = ["/api/auth/exchange_google_code"];
  // Create a Jwt, frontend call to auth server
  if (publicRoutes.includes(request.url)) {
    await authProxy(request, reply);
    return;
  }
  // Else enforce authentification
  const authHeader = request.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'Missing or invalid Authorization header' });
    return;
  }
  // Extract token from "Bearer <token>"
  const token = authHeader.split(' ')[1];
  try {
    // Verify token using jose, store JWKS 
    // cache under the hood
    const payload = await verifyJwt(token);
    // console.log("JWT payload: ", payload);
    request.jwt = payload;
    // console.log("request jwt: ", request.jwt);
  }
  catch (error: any) {
    console.error("JWT verification failed:", error.message);
    reply.code(401).send({ error: 'Invalid or expired token' });
  }
}

async function authProxy(request: any, reply: any) {
  try {
    // Forward the request body to your backend auth server
    const response = await fetch('http://authserver:3002/auth/exchange_google_code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.body),
    });
    const data = await response.json();
    console.log("PreHook: Auth succeeded");
    reply.code(response.status).send(data);
  }
  catch (err) {
    console.error('Error in exchange_google_code route:', err);
    reply.code(500).send({ message: 'Internal Gateway Error' });
  }
}
