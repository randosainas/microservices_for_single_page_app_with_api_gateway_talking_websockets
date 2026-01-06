import {
  FastifyRequest,
  FastifyReply,
  RouteShorthandOptions
}
  from "fastify";
import 'dotenv/config';

// This interface can be extended.
export interface IGatewayRouteOptions
  extends Omit<RouteShorthandOptions, 'handler' | 'schema'> {
  schema: {
    params?: {
      type: string,
      properties: Record<string, unknown>,
      required?: string[],
    },
    response?:
    Record<number, unknown>
  }
  handler(request: FastifyRequest, reply: FastifyReply): Promise<unknown>;
}

const responseItem = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    user: { type: 'object', additionalProperties: true },
  },
  required: ['message'] // Every response should have a message.
};

// This object will be the standard route options for all API endpoints.

const ApiRoutes: IGatewayRouteOptions = {
  schema: {
    params: {
      type: 'object',
      properties: {
        test: { type: 'string' }
      },
    },
    response: { 200: responseItem, 201: responseItem },
  },

  // If you want to add a microservice, just add it to the .env file following
  // the pattern of the others.

  handler: async function(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Dynamically load the url of the api endpoints.
      const apiEndpoint = (request.params as { service: string }).service;
      let apiUrl = process.env[`internal_api_${apiEndpoint}`] as string;
      if ((request.params as { id: string }).id)
        apiUrl += "/" + (request.params as { id: string }).id;

      // Make the object to pass onto the microservice.
      const { headers, method, body, jwt } = request; // user set in preHandler 'verificationHook'

      // Fetch API and FastifyRequest have different ways of doing the headers,
      // For typesafety we first have to convert to the Fetch API headers.
      const forwardedHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(headers)) {
        if (value === undefined) continue; // skip undefined
        // Convert arrays like ['a', 'b'] to 'a, b'
        forwardedHeaders[key] = Array.isArray(value) ? value.join(', ') : value;
      }

      delete forwardedHeaders['host']; // Delete hop-by-hop headers.

      if (jwt && jwt.id) {
        forwardedHeaders["x-user-id"] = jwt.id;
      }

      const options: RequestInit = {
        method: method,
        headers: forwardedHeaders,
        body: body ? JSON.stringify(body) : undefined,
      };

      // Pass on the request.
      const response = await fetch(apiUrl, options);
      let responseJson = await response.json();
      reply.code(response.status).send(responseJson);
    }
    catch (err) {
      console.error('Error in ApiRoutes object. Fetch to a backend service \
				failed in the api gateway.', err);
      reply.code(500).send({ message: 'Internal Gateway Error' });
    }
  }
}

export default ApiRoutes;
