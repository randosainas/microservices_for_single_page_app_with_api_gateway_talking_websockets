import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    jwt?: { 
	  id?: string;
      iat?: number;
      exp?: number;
    }
  }
}
