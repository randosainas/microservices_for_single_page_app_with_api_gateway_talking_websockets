import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import database from '../drizzle/databaseLauncher';
import { FastifyRequest, FastifyReply } from 'fastify';

const responseItem = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    user: { $ref: 'userSchema#' },
  },
  required: ['message']
}

export const getUserOpts = {
  schema: {
    params: {
      type: 'object',
      properties: {
        username: { type: 'string' },
      },
      required: ['username'],
    },
    response: { 200: responseItem }
  },
  handler: async function(request: FastifyRequest, reply: FastifyReply) {
    const { username } = request.params as { username: string };
    const userArray = await database.select().from(users)
      .where(eq(users.username, username));
    if (userArray.length === 0)
      reply.code(404).send({ message: "User not found." });
    else
      reply.code(200).header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
				.header('Pragma', 'no-cache').header('Expires', '0')
				.send({ message: "User found.", user: userArray[0] });
  }
}

export default getUserOpts;
