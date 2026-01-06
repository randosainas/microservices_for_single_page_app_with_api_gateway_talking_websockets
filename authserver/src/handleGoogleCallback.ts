import { FastifyRequest, FastifyReply } from "fastify";
import { handleTokenVerification, googleTokenResponse } from "./verifyGoogleTokenId";
import { issueJwt } from "./issueJwt";
import { userManagerUser } from "./typeUser";

interface AuthRequestBody {
  code?: string;
  state?: string;
}

export async function findOrCreateUser(payloadGoogle: any): Promise<userManagerUser> {
  const userManagerUrl = process.env.USER_MANAGER_URL || "http://user-manager:4001";
  const user_database_response = await fetch(`${userManagerUrl}/api/v1/users/find-or-create`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      google_id: payloadGoogle.payload.sub,
      username: payloadGoogle.payload.name, 
      profilePic: payloadGoogle.payload.picture 
    })
  })
  const response_json = await user_database_response.json();

  if (!user_database_response.ok) {
    throw new Error(`Database error: ${response_json.message}`)
  }

  return response_json.user;
}

export async function handleGoogleCallback(
  request: FastifyRequest<{ Body: AuthRequestBody }>,
  reply: FastifyReply
) {
  try {
    const { code, state } = request.body || {};

    if (!code || !state) {
      //  genearal public error messages to hinder attack evolution
      request.log.warn("Missing code or state on OAuth callback");
      return reply.code(400).send({ message: "Login failed." });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret)
      throw new Error("Missing Google client ID/secret");

    // Google token exchange endpoint
    const tokenEndpoint = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
      client_id: clientId,
      code,
      client_secret: clientSecret,
      redirect_uri: process.env.REDIRECT_URI || "https://localhost/oauth/callback",
      grant_type: "authorization_code",
    });

    const tokenResp = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const tokenData: googleTokenResponse = await tokenResp.json();
    if (!tokenResp.ok) {
      request.log.error(tokenData, "Token exchange failed");
      return reply.code(400).send({ message: "Login failed." });
    }

    const payloadGoogle = await handleTokenVerification(tokenData);
    const internal_user = await findOrCreateUser(payloadGoogle);
    const internalJwt = await issueJwt(internal_user.id, payloadGoogle);
    // console.log("internal_user: ", internal_user);
    // console.log("Token exchange OK:", tokenData);
    // console.log("Internal Jwt issed for a client:", internalJwt);
    // console.log("Google payload:", payloadGoogle);

    return reply.code(200).send({
      message: "Login OK",
      token: internalJwt,
      user: {
        // id: internal_user.id,
        name: internal_user.username,
        avatarUrl: internal_user.profilePic,
        isGuest: false,
      }
    });
  } catch (err) {
    request.log.error(err, "Error handling OAuth callback");
    return reply.code(500).send({ message: "Internal Server Error" });
  }
}
